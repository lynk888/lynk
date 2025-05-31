import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMessages } from '../../../hooks/useMessages';
import { useTypingIndicator } from '../../../hooks/useTypingIndicator';
import { ConversationService } from '../../../services/conversationService';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../utils/supabase';

export default function RealTimeChat() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { token } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get messages with real-time updates
  const {
    messages,
    sendMessage,
    loadMoreMessages,
    hasMore,
    markAllAsRead
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
    }
  }, [conversationId, markAllAsRead]);

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

    console.log('Attempting to send message:', {
      conversationId,
      messageContent: message.trim(),
      currentUserId
    });

    try {
      const result = await sendMessage(message.trim());
      console.log('Message sent successfully:', result);
      setMessage('');
      setTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      // Show user-friendly error message
      alert('Failed to send message. Please try again.');
    }
  };

  // Handle typing indicator
  const handleTyping = (text: string) => {
    setMessage(text);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing indicator to true
    if (text.length > 0) {
      setTyping(true);

      // Set a timeout to clear the typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 2000);
    } else {
      setTyping(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {participants.length > 0 ? participants[0].username || 'Chat' : 'Chat'}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSentByMe = item.sender_id === currentUserId;
          return (
            <View style={[
              styles.messageBubble,
              isSentByMe ? styles.sentMessage : styles.receivedMessage
            ]}>
              <Text style={[
                styles.messageText,
                isSentByMe ? styles.sentMessageText : styles.receivedMessageText
              ]}>
                {item.content}
              </Text>
              <Text style={[
                styles.messageTime,
                isSentByMe ? styles.sentMessageTime : styles.receivedMessageTime
              ]}>
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={styles.messageList}
        onEndReached={hasMore ? loadMoreMessages : undefined}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={hasMore ? (
          <ActivityIndicator size="small" color="#007AFF" style={styles.loadingMore} />
        ) : null}
        inverted={false}
      />

      {isAnyoneTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>Someone is typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={handleTyping}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: 'white',
  },
  receivedMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  sentMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedMessageTime: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  typingIndicator: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#b0b0b0',
  },
  loadingMore: {
    marginVertical: 16,
  },
});
