import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Message, MessageService } from '../services/messageService';

export function useMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [oldestMessageDate, setOldestMessageDate] = useState<string | null>(null);

  // Fetch initial messages
  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const initialMessages = await MessageService.getMessages(conversationId);

        if (isMounted) {
          // Sort messages by created_at in ascending order
          const sortedMessages = initialMessages.sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          setMessages(sortedMessages);

          // Set oldest message date for pagination
          if (sortedMessages.length > 0) {
            setOldestMessageDate(sortedMessages[0].created_at);
          }

          // If we got fewer messages than the limit, there are no more to load
          setHasMore(initialMessages.length === 50);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  // Subscribe to new messages and read status updates
  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to new messages and read status
    const unsubscribe = MessageService.subscribeToMessages(
      conversationId,
      (newMessage) => {
        setMessages(prevMessages => {
          // Check if message already exists (to prevent duplicates)
          if (prevMessages.some(msg => msg.id === newMessage.id)) {
            return prevMessages;
          }
          return [...prevMessages, newMessage];
        });
      },
      (userId, messageIds) => {
        // Update read status for messages
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
          )
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!conversationId || !hasMore || !oldestMessageDate || loading) return;

    try {
      setLoading(true);
      const olderMessages = await MessageService.getMessages(conversationId, 50, oldestMessageDate);

      if (olderMessages.length === 0) {
        setHasMore(false);
        return;
      }

      // Sort messages by created_at in ascending order
      const sortedMessages = olderMessages.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Update oldest message date for next pagination
      if (sortedMessages.length > 0) {
        setOldestMessageDate(sortedMessages[0].created_at);
      }

      // Merge with existing messages
      setMessages(prev => [...sortedMessages, ...prev]);

      // If we got fewer messages than the limit, there are no more to load
      setHasMore(olderMessages.length === 50);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more messages'));
    } finally {
      setLoading(false);
    }
  }, [conversationId, hasMore, oldestMessageDate, loading]);

  // Send a message
  const sendMessage = useCallback(async (content: string, attachmentUrl?: string, attachmentType?: string) => {
    if (!conversationId) return null;

    try {
      const message = await MessageService.sendMessage(
        conversationId,
        content,
        attachmentUrl,
        attachmentType
      );

      // The real-time subscription will handle adding the message to the state
      return message;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      return null;
    }
  }, [conversationId]);

  // Mark all messages as read
  const markAllAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await MessageService.markAllAsRead(conversationId);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMoreMessages,
    sendMessage,
    markAllAsRead
  };
}
