import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContacts } from '../../../../hooks/useContacts';
import { useConversations } from '../../../../hooks/useConversations';
import { Contact } from '../../../../services/contactService';

const ContactsScreen = () => {
  const router = useRouter();
  const { contacts, loading, error, refreshContacts, migrateContacts } = useContacts();
  const { findOrCreateOneToOneConversation } = useConversations();
  const [migrated, setMigrated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Migrate contacts from AsyncStorage to Supabase on first load
  useEffect(() => {
    const initializeContacts = async () => {
      if (!migrated) {
        try {
          await migrateContacts();
          setMigrated(true);
        } catch (err) {
          console.error('Failed to migrate contacts:', err);
        }
      }
    };
    initializeContacts();
  }, [migrateContacts, migrated]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        error.message || 'An unexpected error occurred. Please try again.',
        [
          {
            text: 'Retry',
            onPress: refreshContacts
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    }
  }, [error, refreshContacts]);

  // Handle contact press - find or create conversation and navigate to chat
  const handleContactPress = async (contact: Contact) => {
    if (isNavigating) return; // Prevent multiple navigation attempts
    
    try {
      setIsNavigating(true);
      const conversation = await findOrCreateOneToOneConversation(contact.contact_id);

      if (conversation) {
        router.push({
          pathname: '/(root)/Chat/ChatScreen2',
          params: {
            conversationId: conversation.id,
            contactId: contact.contact_id,
            name: contact.display_name,
            avatarUri: contact.profile?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.display_name)}&background=random`
          }
        });
      }
    } catch (err) {
      Alert.alert(
        'Error',
        'Failed to open chat. Please try again.',
        [
          {
            text: 'Retry',
            onPress: () => handleContactPress(contact)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      console.error('Error opening chat:', err);
    } finally {
      setIsNavigating(false);
    }
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.contactInfo}>
        <Image
          source={{
            uri: item.profile?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(item.display_name)}&background=random`
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.contactName}>{item.display_name}</Text>
          <Text style={styles.statusText}>
            {item.profile?.email || 'Contact'}
          </Text>
        </View>
      </View>
      <View style={styles.onlineIndicator} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Contacts</Text>

      <TouchableOpacity
        style={styles.addFriendsButton}
        onPress={() => router.push('/(root)/Chat/Contact/AddContactScreen')}
      >
        <Ionicons name="person-add-outline" size={24} color="#000" />
        <Text style={styles.addFriendsText}>Add Friends</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyText}>No contacts yet</Text>
          <Text style={styles.emptySubtext}>Add friends to start chatting</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          style={styles.contactsList}
          refreshing={loading}
          onRefresh={refreshContacts}
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="people" size={24} color="#007AFF" />
          <Text style={[styles.navText, styles.activeNavText]}>Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(root)/Calls/CallsScreen')}
        >
          <Ionicons name="call-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Calls</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(root)/Chat/ChatScreen')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Chat</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/(root)/Settings/SettingsScreen')}
        >
          <Ionicons name="settings-outline" size={24} color="#8E8E93" />
          <Text style={styles.navText}>Settings</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  addFriendsText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  contactsList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 14,
    color: '#007AFF',
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CD964',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
  },
  navItem: {
    alignItems: 'center',
    position: 'relative',
  },
  navText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  activeNavText: {
    color: '#007AFF',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ContactsScreen;
