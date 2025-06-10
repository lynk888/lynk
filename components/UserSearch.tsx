import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
// import { useSimpleContacts } from '../hooks/useSimpleContacts';
// import { useMessageStore } from '../store/messageStore';
// import { BlockingService } from '../services/blockingService';
import { UserService, User } from '../services/userService';
import { Colors } from '../constants/Colors';
import { MessageCountBadge } from './MessageCountBadge';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Chat: { conversationId: string; recipientName: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

interface UserSearchProps {
  onUserSelected?: (user: User) => void;
  showAddToContacts?: boolean;
  showMessageCounts?: boolean;
}

interface UserItemProps {
  user: User;
  onPress: () => void;
  onStartConversation: () => void;
  onAddToContacts?: () => void;
  showStartChatButton: boolean;
  showAddToContactsButton?: boolean;
  showMessageCount?: boolean;
  messageCount?: number;
  getLastSeenText: (lastSeen: string | undefined, isOnline: boolean | undefined) => string;
  isSelected?: boolean;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onPress,
  onStartConversation,
  onAddToContacts,
  showStartChatButton,
  showAddToContactsButton = false,
  showMessageCount = false,
  messageCount = 0,
  getLastSeenText,
  isSelected = false
}) => {
  // Use the user data directly without additional hooks to avoid hook violations in FlatList
  const isOnline = user.is_online;
  const lastSeen = user.last_seen;

  return (
    <TouchableOpacity
      style={[
        styles.userItem,
        isSelected && styles.userItemSelected
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {user.avatar_url ? (
          <Image
            source={{ uri: user.avatar_url }}
            style={styles.avatar}
            onError={() => {
              console.log('Error loading avatar for user:', user.username);
            }}
          />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Text style={styles.defaultAvatarText}>
              {(user.username || user.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.userInfo}>
        <View style={styles.userInfoHeader}>
          <Text style={styles.username}>{user.username}</Text>
          {showMessageCount && messageCount > 0 && (
            <MessageCountBadge count={messageCount} size="small" />
          )}
        </View>
        <Text style={styles.lastSeen}>
          {getLastSeenText(lastSeen, isOnline)}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        {showAddToContactsButton && onAddToContacts && (
          <TouchableOpacity
            style={styles.addContactButton}
            onPress={onAddToContacts}
          >
            <Text style={styles.addContactButtonText}>Add</Text>
          </TouchableOpacity>
        )}

        {showStartChatButton && (
          <TouchableOpacity
            style={styles.startChatButton}
            onPress={onStartConversation}
          >
            <Text style={styles.startChatButtonText}>Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelected,
  showAddToContacts = false,
  showMessageCounts = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const searchTimeout = useRef<NodeJS.Timeout>();

  // Store hooks (temporarily disabled)
  // const { addContact, refreshContacts } = useSimpleContacts();
  // const { messageCounts } = useMessageStore();

  // Use the online status hook
  useOnlineStatus();

  // Verify database setup on component mount
  useEffect(() => {
    const verifyDatabaseSetup = async (): Promise<void> => {
      try {
        const { error: dbError } = await supabase
          .from('profiles')
          .select('is_online, last_seen')
          .limit(1);

        if (dbError) {
          console.error('Database setup error:', dbError);
          Alert.alert(
            'Setup Error',
            'There seems to be an issue with the database setup. Please contact support.'
          );
        }
      } catch (err) {
        console.error('Error verifying database setup:', err);
      }
    };

    void verifyDatabaseSetup();
  }, []);

  // Search function
  const searchUsers = async (term: string, pageNum: number): Promise<void> => {
    if (!term.trim()) {
      setUsers([]);
      setHasMore(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try the search function with explicit type casting
      let { data, error: searchError } = await supabase
        .rpc('search_users', {
          search_term: term as string,
          page_number: pageNum as number,
          page_size: 20 as number
        });

      // If search function doesn't exist, fall back to direct table query
      if (searchError && searchError.code === '42883') {
        console.log('Search function not found, using direct query');
        const directResult = await supabase
          .from('profiles')
          .select('id, username, email, avatar_url, created_at, updated_at')
          .or(`username.ilike.%${term}%, email.ilike.%${term}%`)
          .neq('id', (await supabase.auth.getUser()).data.user?.id || '')
          .order('username')
          .range((pageNum - 1) * 20, pageNum * 20 - 1);

        data = directResult.data;
        searchError = directResult.error;
      }

      if (searchError) {
        throw new Error(searchError.message);
      }

      // Filter out blocked users manually if using basic search (temporarily disabled)
      let filteredData = data || [];
      // try {
      //   filteredData = await BlockingService.filterBlockedUsers(data || []);
      // } catch (blockingError) {
      //   console.log('Blocking filter failed, using unfiltered results:', blockingError);
      //   // Continue with unfiltered results if blocking service fails
      // }

      if (pageNum === 1) {
        setUsers(filteredData);
      } else {
        setUsers(prev => prev.concat(filteredData));
      }

      setHasMore(filteredData.length === 20);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search users';
      setError(errorMessage);
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string): void => {
    setSearchTerm(text);
    setPage(1);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      void searchUsers(text, 1);
    }, 300);
  };

  const loadMore = (): void => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      void searchUsers(searchTerm, nextPage);
    }
  };

  const getLastSeenText = (lastSeen: string | undefined, isOnline: boolean | undefined): string => {
    if (isOnline) return 'Online';
    if (!lastSeen) return 'Recently active';
    try {
      return `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`;
    } catch (err) {
      return 'Recently active';
    }
  };

  const handleUserPress = (user: User) => {
    setSelectedUserId(user.id);
    if (onUserSelected) {
      onUserSelected(user);
    }
  };

  const handleAddToContacts = async (user: User) => {
    try {
      // Check if user is blocked (temporarily disabled)
      // const isBlocked = await BlockingService.isUserBlocked(user.id);
      // const isBlockedBy = await BlockingService.isBlockedBy(user.id);

      // if (isBlocked || isBlockedBy) {
      //   Alert.alert('Error', 'Cannot add blocked user to contacts');
      //   return;
      // }

      // Add to contacts via UserService
      await UserService.addContact(user.id, user.username || user.email);

      // Update local store (temporarily disabled)
      // addContact(user);

      // Refresh contacts list (temporarily disabled)
      // await refreshContacts();

      Alert.alert('Success', `${user.username || user.email} has been added to your contacts`);
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  const renderUserItem = ({ item }: { item: User }): JSX.Element => {
    const messageCount = showMessageCounts ? 0 : 0; // Simplified for now

    return (
      <UserItem
        user={item}
        onPress={() => handleUserPress(item)}
        onStartConversation={() => handleUserPress(item)}
        onAddToContacts={showAddToContacts ? () => handleAddToContacts(item) : undefined}
        showStartChatButton={!onUserSelected}
        showAddToContactsButton={showAddToContacts}
        showMessageCount={showMessageCounts}
        messageCount={messageCount}
        getLastSeenText={getLastSeenText}
        isSelected={selectedUserId === item.id}
      />
    );
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={searchTerm}
        onChangeText={handleSearch}
        autoCapitalize="none"
      />

      {loading && page === 1 && <ActivityIndicator style={styles.loader} />}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void searchUsers(searchTerm, 1)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && searchTerm ? (
            <Text style={styles.noResults}>No users found</Text>
          ) : null
        }
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator style={styles.loader} />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background.primary,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: Colors.background.secondary,
    color: Colors.text.primary,
  },
  list: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  userItemSelected: {
    backgroundColor: Colors.accent.selection,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background.tertiary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.status.success,
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  userInfo: {
    flex: 1,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  lastSeen: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: Colors.status.error + '20', // 20% opacity
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  error: {
    color: Colors.status.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: Colors.status.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    color: Colors.text.tertiary,
    marginTop: 20,
  },
  addContactButton: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border.medium,
  },
  addContactButtonText: {
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  startChatButton: {
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startChatButtonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 12,
  },
  defaultAvatar: {
    backgroundColor: Colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: Colors.text.inverse,
    fontSize: 24,
    fontWeight: '600',
  },
});
