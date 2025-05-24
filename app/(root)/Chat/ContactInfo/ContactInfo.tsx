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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContacts } from '../../../../hooks/useContacts';
import { Contact } from '../../../../services/contactService';

const ContactInfo = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { contactName, contactId, conversationId } = params;

  const { contacts, loading, error, updateContactName } = useContacts();
  const [name, setName] = useState(contactName ? String(contactName) : '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);

  // Find the contact in the contacts list
  useEffect(() => {
    if (contacts && contactId) {
      const foundContact = contacts.find(c => c.contact_id === contactId);
      if (foundContact) {
        setContact(foundContact);
        setName(foundContact.display_name);
      }
    }
  }, [contacts, contactId]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error.message);
    }
  }, [error]);

  // Save contact name to database
  const saveContactName = async () => {
    if (!contactId) {
      Alert.alert('Error', 'Contact ID is missing');
      return;
    }

    try {
      setIsSaving(true);

      // Update contact name in database
      await updateContactName(String(contactId), name);

      // Navigate back to chat screen with updated name
      router.push({
        pathname: '/(root)/Chat/ChatScreen2',
        params: {
          conversationId: conversationId,
          contactId: contactId,
          name: name,
          // Force refresh by adding timestamp
          _timestamp: Date.now()
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save contact name');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <>
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
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
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
              source={{
                uri: contact?.profile?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
              }}
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

            {contact?.profile?.email && (
              <Text style={styles.email}>{contact.profile.email}</Text>
            )}
          </View>
        </>
      )}

      {!loading && (
        <>
          {/* Info Section */}
          {contact?.profile && (
            <View style={styles.infoSection}>
              {contact.profile.username && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>username</Text>
                  <Text style={styles.infoText}>@{contact.profile.username}</Text>
                </View>
              )}
            </View>
          )}

          {/* Actions Section */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Archive Chats',
                  'Are you sure you want to archive all chats with this contact?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Archive',
                      style: 'destructive',
                      onPress: () => {
                        // TODO: Implement archive chats functionality
                        Alert.alert('Success', 'Chats archived successfully');
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.actionTextBlue}>Archive Chats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Clear All Chats',
                  'Are you sure you want to clear all chats with this contact? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: () => {
                        // TODO: Implement clear chats functionality
                        Alert.alert('Success', 'Chats cleared successfully');
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.actionTextRed}>Clear All Chats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Delete Contact',
                  'Are you sure you want to delete this contact? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          // TODO: Implement delete contact functionality
                          router.replace('/(root)/Chat/Contact/ContactScreen');
                          Alert.alert('Success', 'Contact deleted successfully');
                        } catch (error) {
                          Alert.alert('Error', 'Failed to delete contact');
                          console.error(error);
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.actionTextRed}>Delete Contact</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    minWidth: 50,
    alignItems: 'center',
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
  email: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
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
