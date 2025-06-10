
import { useEffect, useState, useRef, useCallback } from 'react';
import { TypingService } from '../services/typingService';

export function useTypingIndicator(conversationId: string | undefined) {
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Subscribe to typing status updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = TypingService.subscribeToTypingIndicators(
      conversationId,
      (userId, isTyping) => {
        setTypingUsers(prev => ({
          ...prev,
          [userId]: isTyping
        }));

        // Auto-clear typing status after 5 seconds
        if (isTyping) {
          // Clear any existing timeout for this user
          if (typingTimeoutRef.current[userId]) {
            clearTimeout(typingTimeoutRef.current[userId]);
          }

          // Set new timeout
          typingTimeoutRef.current[userId] = setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [userId]: false
            }));
            delete typingTimeoutRef.current[userId];
          }, 5000);
        }
      }
    );

    return () => {
      // Clear all timeouts
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      typingTimeoutRef.current = {};

      unsubscribe();
    };
  }, [conversationId]);

  // Set typing status with debounce
  const setTyping = useCallback((isTyping: boolean) => {
    if (!conversationId) return;

    TypingService.setTypingIndicator(conversationId, isTyping);
  }, [conversationId]);

  // Check if anyone is typing
  const isAnyoneTyping = Object.values(typingUsers).some(Boolean);

  return { isAnyoneTyping, typingUsers, setTyping };
}
