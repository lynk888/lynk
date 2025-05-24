import { supabase } from '../utils/supabase';

export class TypingService {
  /**
   * Set typing indicator for a user in a conversation
   */
  static async setTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.channel(`typing:${conversationId}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: userData.user.id,
          is_typing: isTyping
        }
      });
  }

  /**
   * Subscribe to typing indicator updates in a conversation
   * @returns A function to unsubscribe
   */
  static subscribeToTypingIndicators(
    conversationId: string,
    callback: (userId: string, isTyping: boolean) => void
  ): () => void {
    const channel = supabase.channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        callback(payload.payload.user_id, payload.payload.is_typing);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
