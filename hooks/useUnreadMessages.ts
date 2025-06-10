import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export function useUnreadMessages() {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;

    // Fetch initial unread counts
    const fetchUnreadCounts = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('conversation_id, count')
        .eq('read', false)
        .neq('sender_id', userId)
        .group('conversation_id');

      if (error) {
        console.error('Error fetching unread counts:', error);
        return;
      }

      const counts: Record<string, number> = {};
      data.forEach(({ conversation_id, count }) => {
        counts[conversation_id] = parseInt(count);
      });
      setUnreadCounts(counts);
    };

    fetchUnreadCounts();

    // Subscribe to new messages
    const channel = supabase.channel('unread_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=neq.${userId}`,
      }, (payload) => {
        const conversationId = payload.new.conversation_id;
        setUnreadCounts(prev => ({
          ...prev,
          [conversationId]: (prev[conversationId] || 0) + 1
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (conversationId: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('read', false)
        .neq('sender_id', userId);

      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const getUnreadCount = (conversationId: string) => {
    return unreadCounts[conversationId] || 0;
  };

  return {
    unreadCounts,
    markAsRead,
    getUnreadCount
  };
} 