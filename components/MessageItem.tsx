import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageAttachment } from './MessageAttachment';
import { Message } from '../services/messageService';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageItem = ({ message, isOwnMessage }: MessageItemProps) => {
  return (
    <View style={[styles.messageContainer, isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
      <Text style={styles.messageText}>{message.content}</Text>
      
      {message.attachment_url && (
        <MessageAttachment 
          url={message.attachment_url}
          type={message.attachment_type || 'application/octet-stream'}
        />
      )}
      
      <Text style={styles.timestamp}>
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});