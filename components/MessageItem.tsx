import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  attachment_url?: string;
  attachment_type?: string;
}

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  return (
    <View style={[
      styles.messageContainer,
      isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        isOwnMessage ? styles.ownBubble : styles.otherBubble
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownText : styles.otherText
        ]}>
          {message.content}
        </Text>
        
        {message.attachment_url && (
          <Text style={[
            styles.attachmentText,
            isOwnMessage ? styles.ownText : styles.otherText
          ]}>
            📎 {message.attachment_type || 'Attachment'}
          </Text>
        )}
        
        <Text style={[
          styles.timeText,
          isOwnMessage ? styles.ownTimeText : styles.otherTimeText
        ]}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#87CEEB', // Muted sky blue for sent messages
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#DCE3E9', // Soft powder gray for received messages
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: '#FFFFFF', // White text for sent messages
  },
  otherText: {
    color: '#000000', // Black text for received messages
  },
  attachmentText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
});
