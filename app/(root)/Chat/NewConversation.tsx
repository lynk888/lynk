import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { UserSearch, User } from '../../../components/UserSearch';
import { UserService } from '../../../services/userService';
import { ConversationService } from '../../../services/conversationService';
import { Ionicons } from '@expo/vector-icons';

export default function NewConversation() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUserSelected = (user: User) => {
    setSelectedUser(user);
    setError(null);
  };

  const handleStartConversation = async () => {
    if (!selectedUser) {
      setError('Please select a user to chat with');
      return;
    }

    // Validate UUID format
    if (!selectedUser.id || !UserService.isValidUUID(selectedUser.id)) {
      setError('Invalid user ID format. Please select a different user.');
      console.error(`Invalid UUID format for user: ${selectedUser.id}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const conversation = await ConversationService.createConversation([selectedUser.id]);
      const conversationId = conversation?.id;

      if (conversationId) {
        // Navigate to the chat screen with the new conversation
        router.push({
          pathname: '/(root)/Chat/RealTimeChat',
          params: { conversationId }
        });
      } else {
        setError('Failed to create conversation');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error creating conversation:', err);
      setError(`Error creating conversation: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Conversation</Text>
      </View>

      <UserSearch onUserSelected={handleUserSelected} />

      {selectedUser && (
        <View style={styles.selectedUserContainer}>
          <Text style={styles.selectedUserTitle}>Selected User:</Text>
          <View style={styles.selectedUserCard}>
            <View style={styles.userInfo}>
              <Text style={styles.username}>{selectedUser.username || 'User'}</Text>
              <Text style={styles.email}>{selectedUser.email}</Text>
            </View>
          </View>
        </View>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <TouchableOpacity
        style={[styles.startButton, !selectedUser && styles.startButtonDisabled]}
        onPress={handleStartConversation}
        disabled={!selectedUser || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.startButtonText}>Start Conversation</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedUserContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedUserTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  selectedUserCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: 'red',
    padding: 16,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#b0b0b0',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
