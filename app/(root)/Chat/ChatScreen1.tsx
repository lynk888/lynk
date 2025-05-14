import React from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
}

const ChatScreen1 = () => {
  const router = useRouter();
  
  const messages: Message[] = [
    {
      id: '1',
      text: 'How is it ?',
      time: '11:45',
      isSent: true,
    },
    {
      id: '2',
      text: 'I like the changes and the new designs',
      time: '11:51',
      isSent: false,
    },
  ];

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
        
        <View style={styles.headerProfile}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.profileImage}
          />
          <Text style={styles.headerName}>Olumide</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <View style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.isSent ? styles.sentWrapper : styles.receivedWrapper,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.isSent ? styles.sentBubble : styles.receivedBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isSent ? styles.sentText : styles.receivedText,
                ]}
              >
                {message.text}
              </Text>
              <Text
                style={[
                  styles.messageTime,
                  message.isSent ? styles.sentTime : styles.receivedTime,
                ]}
              >
                {message.time}
              </Text>
            </View>
          </View>
        ))}
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
          placeholder="Message"
          placeholderTextColor="#8E8E93"
        />
        
        <TouchableOpacity style={styles.micButton}>
          <Ionicons name="mic" size={24} color="#8E8E93" />
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
  micButton: {
    padding: 8,
  },
});

export default ChatScreen1;
