import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageAttachmentProps {
  url: string;
  type: string;
  fileName?: string;
}

export const MessageAttachment = ({ url, type, fileName }: MessageAttachmentProps) => {
  const isImage = type?.startsWith('image/') ?? false;
  
  const handlePress = () => {
    if (!url) return;
    Linking.openURL(url).catch(err => {
      console.error('Error opening attachment:', err);
      alert('Could not open the attachment');
    });
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      disabled={!url}
    >
      {isImage ? (
        <Image 
          source={{ uri: url }} 
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.fileContainer}>
          <Ionicons 
            name={type?.includes('pdf') ? 'document-text' : 'document'} 
            size={32} 
            color="#007AFF" 
          />
          <Text style={styles.fileName} numberOfLines={1}>
            {fileName || url?.split('/').pop() || 'Attachment'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 8,
    maxWidth: 250,
  },
  fileName: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});