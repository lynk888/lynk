import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMessages } from '../../../hooks/useMessages';
import { useTypingIndicator } from '../../../hooks/useTypingIndicator';

import { supabase } from '../../../utils/supabase';

const ChatScreen2 = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { conversationId, contactId } = params;
  const flatListRef = useRef<FlatList>(null);

  // Initialize with params
  const [contactName] = useState<string>(params.name ? String(params.name) : '');
  const [avatarUri] = useState<string>(params.avatarUri ? String(params.avatarUri) : '');

  // Get current user ID
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    };

    getCurrentUser();
  }, []);

  // Use real-time messages hook
  const {
    messages,
    loading,
    error,
    hasMore,
    loadMoreMessages,
    sendMessage,
    markAllAsRead
  } = useMessages(conversationId ? String(conversationId) : undefined);

  // Use typing indicator hook
  const { isAnyoneTyping, setTyping } = useTypingIndicator(
    conversationId ? String(conversationId) : undefined
  );

  // Handle text input changes with debounced typing indicator
  const [messageText, setMessageText] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (text: string) => {
    setMessageText(text);

    // Set typing indicator with debounce
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Only send typing indicator if text is not empty
    if (text.trim().length > 0) {
      setTyping(true);
    }

    // Clear typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (messageText.trim() === '') return;

    try {
      // Clear typing indicator
      setTyping(false);

      // Clear input
      const textToSend = messageText;
      setMessageText('');

      // Send message
      await sendMessage(textToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  // Mark messages as read when the screen is focused
  useEffect(() => {
    if (conversationId) {
      markAllAsRead();
    }
  }, [conversationId, markAllAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error.message);
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(root)/Chat/Contact/ContactScreen')}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.backText}>Contacts</Text>
        </TouchableOpacity>

        <View style={styles.headerProfile}>
          <Image
            source={{ uri: avatarUri ? String(avatarUri) : 'https://via.placeholder.com/40' }}
            style={styles.profileImage}
          />
          <Text style={styles.headerName}>{contactName || 'Chat'}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              router.push({
                pathname: '/(root)/Chat/ContactInfo/ContactInfo',
                params: { contactName: contactName, contactId: contactId }
              });
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <View style={styles.messagesContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>No messages yet with {contactName || 'this contact'}</Text>
            <Text style={styles.emptyChatSubtext}>Send a message to start a conversation!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted={false}
            renderItem={({ item: message }) => {
              // Determine if message is sent by current user
              const isSent = message.sender_id === currentUserId;

              // Format time
              const messageTime = new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <View
                  style={[
                    styles.messageWrapper,
                    isSent ? styles.sentWrapper : styles.receivedWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isSent ? styles.sentBubble : styles.receivedBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isSent ? styles.sentText : styles.receivedText,
                      ]}
                    >
                      {message.content}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        isSent ? styles.sentTime : styles.receivedTime,
                      ]}
                    >
                      {messageTime}
                    </Text>
                  </View>
                </View>
              );
            }}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            ListHeaderComponent={hasMore ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMoreMessages}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.loadMoreText}>Load more messages</Text>
                )}
              </TouchableOpacity>
            ) : null}
          />
        )}

        {/* Typing indicator */}
        {isAnyoneTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDotMiddle]} />
              <View style={styles.typingDot} />
            </View>
            <Text style={styles.typingText}>{contactName || 'Contact'} is typing...</Text>
          </View>
        )}
      </View>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="attach" size={24} color="#8E8E93" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={`Message ${contactName || ''}`}
          placeholderTextColor="#8E8E93"
          value={messageText}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
        >
          <Ionicons
            name={messageText.trim() ? "send" : "mic"}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  headerProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
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
  },
  emptyChatText: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 8,
  },
  emptyChatSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  messagesList: {
    paddingBottom: 8,
  },
  messageWrapper: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  sentWrapper: {
    justifyContent: 'flex-end',
  },
  receivedWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 20,
  },
  sentBubble: {
    backgroundColor: '#007AFF',
    borderTopRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#E8E8EA',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginRight: 40,
  },
  sentText: {
    color: '#FFFFFF',
  },
  receivedText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    position: 'absolute',
    bottom: 8,
    right: 12,
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTime: {
    color: '#8E8E93',
  },
  loadMoreButton: {
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 8,
    alignSelf: 'center',
  },
  loadMoreText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F2F2F7',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#E8E8EA',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8E8E93',
    marginHorizontal: 2,
  },
  typingDotMiddle: {
    opacity: 0.7,
  },
  typingText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default ChatScreen2;