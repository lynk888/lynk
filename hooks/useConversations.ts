import { useEffect, useState, useCallback } from 'react';
import { Conversation, ConversationService } from '../services/conversationService';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ConversationService.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch conversations'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to new conversations
  useEffect(() => {
    try {
      const unsubscribe = ConversationService.subscribeToNewConversations(
        (_conversationId, _createdBy) => {
          // Refetch conversations when a new one is created
          fetchConversations();
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Failed to subscribe to new conversations:', error);
    }
  }, [fetchConversations]);

  // Create a new conversation
  const createConversation = useCallback(async (participantIds: string[]) => {
    try {
      const conversation = await ConversationService.createConversation(participantIds);
      if (conversation) {
        // Refetch conversations to include the new one
        fetchConversations();
      }
      return conversation;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create conversation'));
      return null;
    }
  }, [fetchConversations]);

  // Find or create a one-to-one conversation
  const findOrCreateOneToOneConversation = useCallback(async (otherUserId: string) => {
    try {
      const conversation = await ConversationService.findOrCreateOneToOneConversation(otherUserId);
      if (conversation) {
        // Refetch conversations to include the new one
        fetchConversations();
      }
      return conversation;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to find or create conversation'));
      return null;
    }
  }, [fetchConversations]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await ConversationService.deleteConversation(conversationId);
      // Remove the conversation from the state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete conversation'));
    }
  }, []);

  return {
    conversations,
    loading,
    error,
    refreshConversations: fetchConversations,
    createConversation,
    findOrCreateOneToOneConversation,
    deleteConversation
  };
}
