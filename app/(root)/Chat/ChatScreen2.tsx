import React, { useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
}

// Define a type for our contact data
interface ContactData {
  [key: string]: {
    name: string;
  };
}

const ChatScreen2 = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { contactId } = params;

  // Initialize with params, but will be updated from AsyncStorage if available
  const [contactName, setContactName] = React.useState<string>(params.name ? String(params.name) : '');
  const [avatarUri, setAvatarUri] = React.useState<string>(params.avatarUri ? String(params.avatarUri) : '');

  const [isTyping, setIsTyping] = React.useState(false);
  const [messageText, setMessageText] = React.useState('');
  const [chatMessages, setChatMessages] = React.useState<Message[]>([]);

  // Load contact data from AsyncStorage
  useEffect(() => {
    const loadContactData = async () => {
      try {
        const contactsJson = await AsyncStorage.getItem('contacts');
        if (contactsJson && contactId) {
          const contacts: ContactData = JSON.parse(contactsJson);
          const contact = contacts[String(contactId)];

          if (contact && contact.name) {
            setContactName(contact.name);
            // Update avatar URI based on the new name
            setAvatarUri(`https://ui-avatars.com/api/?name=${contact.name}&background=random`);
          }
        }
      } catch (error) {
        console.error('Error loading contact data:', error);
      }
    };

    loadContactData();
  }, [contactId, params._timestamp]); // Re-run when contactId or timestamp changes

  // Simulate typing indicator after a short delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);

      // Hide typing indicator after 3 seconds
      const hideTimer = setTimeout(() => {
        setIsTyping(false);
      }, 3000);

      return () => clearTimeout(hideTimer);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Function to handle sending a message
  const handleSendMessage = () => {
    if (messageText.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true
    };

    setChatMessages(prevMessages => [...prevMessages, newMessage]);
    setMessageText('');

    // Simulate a reply after 2 seconds
    setTimeout(() => {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);

        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Hi there! This is an automated reply from ${contactName}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSent: false
        };

        setChatMessages(prevMessages => [...prevMessages, replyMessage]);
      }, 2000);
    }, 1000);
  };

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
            onPress={() => router.push({
              pathname: '/(root)/Chat/ContactInfo/ContactInfo',
              params: { contactName: contactName, contactId: contactId }
            })}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <View style={styles.messagesContainer}>
        {chatMessages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>No messages yet with {contactName || 'this contact'}</Text>
            <Text style={styles.emptyChatSubtext}>Send a message to start a conversation!</Text>
          </View>
        ) : (
          chatMessages.map((message) => (
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
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
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
          onChangeText={setMessageText}
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


