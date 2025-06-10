import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
  attachment_url?: string;
  attachment_type?: string;
}

export function useMessages(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { userId } = useAuth();

  const fetchMessages = useCallback(async (limit = 20, before?: string) => {
    if (!conversationId || !userId) return;

    try {
      setLoading(true);
      const query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) {
        query.lt('created_at', before);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMessages(prev => {
        const newMessages = data as Message[];
        if (before) {
          return [...prev, ...newMessages];
        }
        return newMessages;
      });

      setHasMore(data.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
    } finally {
      setLoading(false);
    }
  }, [conversationId, userId]);

  // Initial fetch
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [payload.new as Message, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => prev.map(msg => 
          msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
        ));
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !userId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content,
          read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      throw err;
    }
  };

  const markAllAsRead = async () => {
    if (!conversationId || !userId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('read', false)
        .neq('sender_id', userId);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const deleteConversation = async () => {
    if (!conversationId || !userId) return;

    try {
      // Delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Delete conversation participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId);

      if (participantsError) throw participantsError;

      // Delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      // Clear local state
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete conversation'));
      throw err;
    }
  };

  const loadMoreMessages = useCallback(() => {
    if (loading || !hasMore || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    fetchMessages(20, lastMessage.created_at);
  }, [loading, hasMore, messages, fetchMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    markAllAsRead,
    deleteConversation,
    loadMoreMessages
  };
}
