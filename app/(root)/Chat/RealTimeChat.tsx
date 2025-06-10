import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMessages } from '../../../hooks/useMessages';
import { useTypingIndicator } from '../../../hooks/useTypingIndicator';
import { ConversationService } from '../../../services/conversationService';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';
import { AttachmentService } from '../../../services/attachmentService';
import { MessageItem } from '../../../components/MessageItem';
import { useBlockedUsers } from '../../../hooks/useBlockedUsers';
import { useUnreadMessages } from '../../../hooks/useUnreadMessages';

export default function RealTimeChat() {
  const params = useLocalSearchParams();
  const conversationId = params.conversationId as string;
  const contactId = params.contactId as string;
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [contactProfile, setContactProfile] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { token } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAttachmentMenuVisible, setIsAttachmentMenuVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize hooks
  const { isUserBlocked, blockUser, unblockUser } = useBlockedUsers();
  const { markAsRead } = useUnreadMessages();

  // Get messages with real-time updates
  const {
    messages,
    sendMessage,
    loadMoreMessages,
    hasMore,
    markAllAsRead,
    deleteConversation
  } = useMessages(conversationId);

  // Typing indicator
  const { isAnyoneTyping, setTyping, typingUsers } = useTypingIndicator(conversationId);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setCurrentUserId(userData.user.id);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  // Load conversation participants
  useEffect(() => {
    if (!conversationId) return;

    const fetchParticipants = async () => {
      try {
        const data = await ConversationService.getConversationParticipants(conversationId);
        setParticipants(data);
        if (data.length > 0) {
          setContactProfile(data[0]);
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [conversationId]);

  // Mark messages as read when the screen is focused
  useEffect(() => {
    if (conversationId && markAllAsRead) {
      markAllAsRead();
      markAsRead(String(conversationId));
    }
  }, [conversationId, markAllAsRead, markAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle sending a message
  const handleSend = async () => {
    if (!message.trim() || !conversationId) {
      console.log('Cannot send message: missing content or conversation ID', {
        hasMessage: !!message.trim(),
        hasConversationId: !!conversationId
      });
      return;
    }

    if (contactId && isUserBlocked(contactId)) {
      Alert.alert('Error', 'Cannot send message to blocked user');
      return;
    }

    try {
      const result = await sendMessage(message.trim());
      console.log('Message sent successfully:', result);
      setMessage('');
      setTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Handle typing indicator
  const handleTyping = (text: string) => {
    setMessage(text);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (text.length > 0) {
      setTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 2000);
    } else {
      setTyping(false);
    }
  };

  // Handle chat deletion
  const handleDeleteChat = async () => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation();
              router.back();
            } catch (error) {
              console.error('Error deleting chat:', error);
              Alert.alert('Error', 'Failed to delete chat. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle blocking/unblocking user
  const handleBlockUser = async () => {
    if (!contactId) return;
    
    try {
      if (isUserBlocked(contactId)) {
        await unblockUser(contactId);
        Alert.alert('Success', 'User has been unblocked');
      } else {
        await blockUser(contactId);
        Alert.alert('Success', 'User has been blocked');
      }
    } catch (error) {
      console.error('Error toggling block status:', error);
      Alert.alert('Error', 'Failed to update block status');
    }
  };

  const handleAttachment = async (type: 'image' | 'document') => {
    try {
      setIsUploading(true);
      setIsAttachmentMenuVisible(false);
      
      let result;
      if (type === 'image') {
        result = await AttachmentService.pickImage();
      } else {
        result = await AttachmentService.pickDocument();
      }
      
      if (result) {
        const messageContent = message.trim() || `Shared a ${type}`;
        const attachmentInfo = result.url ? `\n[${type}](${result.url})` : '';
        await sendMessage(messageContent + attachmentInfo);
        setMessage('');
      }
    } catch (error) {
      console.error('Error handling attachment:', error);
      Alert.alert('Error', 'Failed to send attachment. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (contactId && isUserBlocked(contactId)) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>This user has been blocked</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Pressable 
          style={styles.headerProfile}
          onPress={() => router.push(`/(root)/Profile/ProfileScreen?userId=${contactId}`)}
        >
          <Image
            source={{ 
              uri: contactProfile?.avatar_url || 'https://via.placeholder.com/40'
            }}
            style={styles.profileImage}
          />
          <Text style={styles.headerName}>
            {contactProfile?.username || 'User'}
          </Text>
        </Pressable>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowMenu(!showMenu)}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Overlay */}
      {showMenu && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              router.push(`/(root)/Profile/ProfileScreen?userId=${contactId}`);
            }}
          >
            <Ionicons name="person" size={20} color="#000" />
            <Text style={styles.menuItemText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              handleBlockUser();
            }}
          >
            <Ionicons 
              name={isUserBlocked(contactId) ? "lock-open" : "lock-closed"} 
              size={20} 
              color="#000" 
            />
            <Text style={styles.menuItemText}>
              {isUserBlocked(contactId) ? 'Unblock User' : 'Block User'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemDanger]}
            onPress={() => {
              setShowMenu(false);
              handleDeleteChat();
            }}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
            <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
              Delete Chat
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat Messages */}
      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>
              No messages yet with {contactProfile?.username || 'this contact'}
            </Text>
            <Text style={styles.emptyChatSubtext}>
              Send a message to start a conversation!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageItem
                message={item}
                isOwnMessage={item.sender_id === currentUserId}
              />
            )}
            contentContainerStyle={styles.messageList}
            onEndReached={hasMore ? loadMoreMessages : undefined}
            onEndReachedThreshold={0.5}
          />
        )}
        {isAnyoneTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>
              {contactProfile?.username || 'Someone'} is typing...
            </Text>
          </View>
        )}
      </View>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={() => setIsAttachmentMenuVisible(!isAttachmentMenuVisible)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor="#8E8E93"
            multiline
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Ionicons
              name="send"
              size={24}
              color={message.trim() ? '#007AFF' : '#8E8E93'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Menu */}
      {isAttachmentMenuVisible && (
        <View style={styles.attachmentMenu}>
          <TouchableOpacity
            style={styles.attachmentMenuItem}
            onPress={() => handleAttachment('image')}
          >
            <Ionicons name="image" size={24} color="#007AFF" />
            <Text style={styles.attachmentMenuText}>Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.attachmentMenuItem}
            onPress={() => handleAttachment('document')}
          >
            <Ionicons name="document" size={24} color="#007AFF" />
            <Text style={styles.attachmentMenuText}>Document</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 16,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    marginRight: 16,
  },
  menuButton: {
    padding: 4,
  },
  menuOverlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
  },
  menuItemTextDanger: {
    color: '#FF3B30',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyChatText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
  },
  emptyChatSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  messageList: {
    padding: 16,
  },
  typingIndicator: {
    padding: 8,
    backgroundColor: '#F2F2F7',
  },
  typingText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  attachmentMenu: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  attachmentMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  attachmentMenuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#007AFF',
  },
  errorText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    textAlign: 'center',
  },
});

