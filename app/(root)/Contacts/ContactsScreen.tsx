import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { UserService, User } from '../../../services/userService';
// import { useSimpleContacts } from '../../../hooks/useSimpleContacts';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

interface ContactItemProps {
  contact: User;
  onPress: () => void;
  onLongPress: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ contact, onPress, onLongPress }) => {
  return (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {contact.avatar_url ? (
          <Image
            source={{ uri: contact.avatar_url }}
            style={styles.avatar}
            onError={() => {
              console.log('Error loading avatar for contact:', contact.username);
            }}
          />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Text style={styles.defaultAvatarText}>
              {(contact.username || contact.display_name || contact.email)?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {contact.is_online && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>
          {contact.display_name || contact.username || 'Unknown User'}
        </Text>
        <Text style={styles.contactEmail}>{contact.email}</Text>
        {contact.last_seen && (
          <Text style={styles.lastSeen}>
            {contact.is_online 
              ? 'Online' 
              : `Last seen ${formatDistanceToNow(new Date(contact.last_seen), { addSuffix: true })}`
            }
          </Text>
        )}
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.chatButton} onPress={onPress}>
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const ContactsScreen: React.FC = () => {
  const navigation = useNavigation();

  // Use the simple contacts store (temporarily disabled)
  // const {
  //   contacts,
  //   isLoading: loading,
  //   error,
  //   refreshContacts,
  //   removeContact: removeContactFromStore
  // } = useSimpleContacts();

  // Temporary simple state
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadContacts = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Load contacts from UserService
      const contactsList = await UserService.getContacts();
      setContacts(contactsList);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleContactPress = (contact: User) => {
    // Navigate to chat with this contact
    Alert.alert(
      'Start Chat',
      `Start a conversation with ${contact.display_name || contact.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Chat',
          onPress: () => {
            // TODO: Navigate to chat screen
            console.log('Starting chat with:', contact.id);
          },
        },
      ]
    );
  };

  const handleContactLongPress = (contact: User) => {
    Alert.alert(
      'Contact Options',
      `What would you like to do with ${contact.display_name || contact.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'View Profile',
          onPress: () => {
            // TODO: Navigate to profile screen
            console.log('Viewing profile for:', contact.id);
          },
        },
        {
          text: 'Remove Contact',
          style: 'destructive',
          onPress: () => confirmRemoveContact(contact),
        },
      ]
    );
  };

  const confirmRemoveContact = (contact: User) => {
    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${contact.display_name || contact.username} from your contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeContact(contact),
        },
      ]
    );
  };

  const removeContact = async (contact: User) => {
    try {
      // TODO: Implement remove contact functionality in UserService
      console.log('Removing contact:', contact.id);

      // Remove from local state
      setContacts(prev => prev.filter(c => c.id !== contact.id));

      Alert.alert('Success', 'Contact removed successfully');
    } catch (err) {
      console.error('Error removing contact:', err);
      Alert.alert('Error', 'Failed to remove contact');
    }
  };

  const renderContactItem = ({ item }: { item: User }) => (
    <ContactItem
      contact={item}
      onPress={() => handleContactPress(item)}
      onLongPress={() => handleContactLongPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Contacts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start adding friends to see them here!
      </Text>
      <TouchableOpacity
        style={styles.addContactButton}
        onPress={() => {
          // TODO: Navigate to add contact screen
          console.log('Navigate to add contact');
        }}
      >
        <Text style={styles.addContactButtonText}>Add Friends</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => loadContacts()}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.lightBlue} />
        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>
        <Text style={styles.headerSubtitle}>
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
        </Text>
      </View>

      {error ? (
        renderError()
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={contacts.length === 0 ? styles.emptyListContainer : undefined}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadContacts(true)}
              colors={[Colors.primary.lightBlue]}
              tintColor={Colors.primary.lightBlue}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.white,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: Colors.primary.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary.darkSlateGray,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4A5568',
  },
  list: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: Colors.primary.white,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FAFBFC',
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.lightBlue,
  },
  defaultAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#48BB78',
    borderWidth: 2,
    borderColor: Colors.primary.white,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.darkSlateGray,
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 2,
  },
  lastSeen: {
    fontSize: 12,
    color: '#718096',
  },
  actionContainer: {
    marginLeft: 8,
  },
  chatButton: {
    backgroundColor: Colors.primary.lightBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  chatButtonText: {
    color: Colors.primary.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.darkSlateGray,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addContactButton: {
    backgroundColor: Colors.primary.lightBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addContactButtonText: {
    color: Colors.primary.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A5568',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#F56565',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary.lightBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.primary.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContactsScreen;
