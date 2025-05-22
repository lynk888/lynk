import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a type for our contact data
interface ContactData {
  [key: string]: {
    name: string;
  };
}

const ContactInfo = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { contactName, contactId } = params;

  const [name, setName] = useState(contactName ? String(contactName) : '');
  const [isEditing, setIsEditing] = useState(false);

  // Save contact name to AsyncStorage
  const saveContactName = async () => {
    try {
      // Get existing contacts or initialize empty object
      const contactsJson = await AsyncStorage.getItem('contacts');
      const contacts: ContactData = contactsJson ? JSON.parse(contactsJson) : {};

      // Update the contact with new name
      contacts[String(contactId)] = {
        name: name
      };

      // Save back to AsyncStorage
      await AsyncStorage.setItem('contacts', JSON.stringify(contacts));

      // Navigate back to chat screen with updated name
      router.push({
        pathname: '/(root)/Chat/ChatScreen2',
        params: {
          contactId: contactId,
          name: name,
          // Preserve other params that might have been passed
          ...params,
          // Force refresh by adding timestamp
          _timestamp: Date.now()
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save contact name');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact info</Text>

        {isEditing ? (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              setIsEditing(false);
              saveContactName();
            }}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: `https://ui-avatars.com/api/?name=${name}&background=random` }}
          style={styles.profileImage}
        />

        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Contact Name"
            autoFocus
          />
        ) : (
          <Text style={styles.name}>{name}</Text>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>bio</Text>
          <Text style={styles.infoText}>Design adds value faster, than it adds cost</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>username</Text>
          <Text style={styles.infoText}>@zack_life</Text>
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionTextBlue}>Archive Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionTextRed}>Clear All Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionTextRed}>Delete Contact</Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  backText: {
    fontSize: 17,
    color: '#007AFF',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  editText: {
    fontSize: 17,
    color: '#007AFF',
  },
  saveButton: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  saveText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 200,
    textAlign: 'center',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
  },
  infoItem: {
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#000000',
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  actionTextBlue: {
    fontSize: 16,
    color: '#007AFF',
  },
  actionTextRed: {
    fontSize: 16,
    color: '#FF3B30',
  },
});

export default ContactInfo;





