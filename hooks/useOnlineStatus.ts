import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../utils/supabase';

export const useOnlineStatus = () => {
  const updateOnlineStatus = useCallback(async (isOnline: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ 
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateOnlineStatus(true);
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        updateOnlineStatus(false);
      }
    });

    // Set online when hook mounts
    updateOnlineStatus(true);

    return () => {
      // Set offline when hook unmounts
      updateOnlineStatus(false);
      subscription.remove();
    };
  }, [updateOnlineStatus]);

  // Set up periodic refresh
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      updateOnlineStatus(true);
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(refreshInterval);
    };
  }, [updateOnlineStatus]);
};