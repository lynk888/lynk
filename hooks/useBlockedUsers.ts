import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export function useBlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;

    // Fetch blocked users
    const fetchBlockedUsers = async () => {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_user_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching blocked users:', error);
        return;
      }

      setBlockedUsers(new Set(data.map(item => item.blocked_user_id)));
    };

    fetchBlockedUsers();

    // Subscribe to changes in blocked users
    const channel = supabase.channel('blocked_users')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'blocked_users',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBlockedUsers(prev => new Set([...prev, payload.new.blocked_user_id]));
        } else if (payload.eventType === 'DELETE') {
          setBlockedUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(payload.old.blocked_user_id);
            return newSet;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const blockUser = async (userToBlockId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          user_id: userId,
          blocked_user_id: userToBlockId
        });

      if (error) throw error;

      setBlockedUsers(prev => new Set([...prev, userToBlockId]));
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  };

  const unblockUser = async (userToUnblockId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', userId)
        .eq('blocked_user_id', userToUnblockId);

      if (error) throw error;

      setBlockedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userToUnblockId);
        return newSet;
      });
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  };

  const isUserBlocked = (userId: string) => {
    return blockedUsers.has(userId);
  };

  return {
    blockedUsers,
    blockUser,
    unblockUser,
    isUserBlocked
  };
} 