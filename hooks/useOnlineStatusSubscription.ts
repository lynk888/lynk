import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

interface OnlineStatus {
  id: string;
  is_online: boolean;
  last_seen: string;
}

export const useOnlineStatusSubscription = (userId: string) => {
  const [status, setStatus] = useState<OnlineStatus | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, is_online, last_seen')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setStatus(data);
      }
    };

    fetchStatus();

    // Subscribe to changes
    const subscription = supabase
      .channel('online_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setStatus(payload.new as OnlineStatus);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return status;
}; 