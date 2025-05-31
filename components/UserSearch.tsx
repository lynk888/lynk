import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  email: string;
  is_online: boolean;
  last_seen: string;
}

type RootStackParamList = {
  Chat: { conversationId: string; recipientName: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

interface UserSearchProps {
  onUserSelected?: (user: User) => void;
}

interface UserItemProps {
  user: User;
  onPress: () => void;
  onStartConversation: () => void;
  showStartChatButton: boolean;
  getLastSeenText: (lastSeen: string, isOnline: boolean) => string;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onPress,
  onStartConversation,
  showStartChatButton,
  getLastSeenText
}) => {
  // Use the user data directly without additional hooks to avoid hook violations in FlatList
  const isOnline = user.is_online;
  const lastSeen = user.last_seen;

  return (
    <TouchableOpacity
      style={styles.userItem}
      onPress={onPress}
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
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.lastSeen}>
          {getLastSeenText(lastSeen, isOnline)}
        </Text>
      </View>
      {showStartChatButton && (
        <TouchableOpacity
          style={styles.startChatButton}
          onPress={onStartConversation}
        >
          <Text style={styles.startChatButtonText}>Start Chat</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export const UserSearch: React.FC<UserSearchProps> = ({ onUserSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const searchTimeout = useRef<NodeJS.Timeout>();

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
      const { data, error: searchError } = await supabase
        .rpc('search_users', {
          search_term: term,
          page_number: pageNum,
          page_size: 20
        });

      if (searchError) {
        throw new Error(searchError.message);
      }

      if (pageNum === 1) {
        setUsers(data || []);
      } else {
        setUsers(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data || []).length === 20);
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

  const getLastSeenText = (lastSeen: string, isOnline: boolean): string => {
    if (isOnline) return 'Online';
    try {
      return `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`;
    } catch (err) {
      return 'Last seen recently';
    }
  };

  const handleUserPress = (user: User) => {
    if (onUserSelected) {
      onUserSelected(user);
    }
  };

  const renderUserItem = ({ item }: { item: User }): JSX.Element => {
    return (
      <UserItem
        user={item}
        onPress={() => handleUserPress(item)}
        onStartConversation={() => handleUserPress(item)}
        showStartChatButton={!onUserSelected}
        getLastSeenText={getLastSeenText}
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
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  list: {
    flex: 1,
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lastSeen: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  startChatButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  startChatButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  defaultAvatar: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
});
