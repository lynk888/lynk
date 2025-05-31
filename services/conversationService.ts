import { supabase } from '../utils/supabase';

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_text?: string;
  last_message_time?: string;
  participants?: User[];
  unread_count?: number;
}

export interface User {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
}

export class ConversationService {
  /**
   * Create a new conversation with participants
   */
  static async createConversation(participantIds: string[]): Promise<Conversation | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return null;
    }

    // Create conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Add all participants including current user
    const allParticipantIds = [...new Set([...participantIds, userData.user.id])];

    const participants = allParticipantIds.map(userId => ({
      conversation_id: conversation.id,
      user_id: userId
    }));

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (participantError) throw participantError;

    // Notify all participants about the new conversation
    for (const participantId of participantIds) {
      if (participantId !== userData.user.id) {
        const channel = supabase.channel(`user:${participantId}`);
        await channel.send({
          type: 'broadcast',
          event: 'new_conversation',
          payload: {
            conversation_id: conversation.id,
            created_by: userData.user.id
          }
        });
      }
    }

    return conversation;
  }

  /**
   * Get a conversation by ID
   */
  static async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all conversations for the current user
   */
  static async getConversations(): Promise<Conversation[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner(user_id)
      `)
      .eq('conversation_participants.user_id', userData.user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get participants of a conversation
   */
  static async getConversationParticipants(conversationId: string): Promise<User[]> {
    try {
      // First get the participant user IDs
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId);

      if (participantError) {
        console.error('Error getting participants:', participantError);
        throw participantError;
      }

      if (!participantData || participantData.length === 0) {
        return [];
      }

      // Get user IDs
      const userIds = participantData.map(p => p.user_id);

      // Try to get profile information for these users
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, email')
        .in('id', userIds);

      if (profileError) {
        console.log('Error getting profiles, returning user IDs only:', profileError);
        // If profiles query fails, return just the user IDs
        return userIds.map(id => ({ id }));
      }

      // Combine participant data with profile data
      return userIds.map(userId => {
        const profile = profileData?.find(p => p.id === userId);
        return {
          id: userId,
          username: profile?.username,
          avatar_url: profile?.avatar_url,
          email: profile?.email
        };
      });
    } catch (err) {
      console.error('Error getting conversation participants:', err);
      return [];
    }
  }

  /**
   * Find or create a conversation between two users
   */
  static async findOrCreateOneToOneConversation(otherUserId: string): Promise<Conversation | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    // Check if a conversation already exists between these two users
    // First, get all conversations where the other user is a participant
    const { data: otherUserConversations, error: otherUserError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', otherUserId);

    if (otherUserError) throw otherUserError;

    if (!otherUserConversations || otherUserConversations.length === 0) {
      // Other user has no conversations, create a new one
      return this.createConversation([otherUserId]);
    }

    // Get conversations where current user is also a participant
    const otherUserConversationIds = otherUserConversations.map(c => c.conversation_id);
    const { data: existingConversations, error: findError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(id)
      `)
      .eq('user_id', userData.user.id)
      .in('conversation_id', otherUserConversationIds);

    if (findError) throw findError;

    // If a conversation exists, return it
    if (existingConversations && existingConversations.length > 0) {
      const conversationId = existingConversations[0].conversation_id;
      return this.getConversation(conversationId);
    }

    // Otherwise, create a new conversation
    return this.createConversation([otherUserId]);
  }

  /**
   * Delete a conversation
   */
  static async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  }

  /**
   * Subscribe to new conversations
   */
  static subscribeToNewConversations(
    callback: (conversationId: string, createdBy: string) => void
  ): () => void {
    // Return a function that sets up the subscription
    try {
      // Create a generic channel ID
      // We'll get the user ID asynchronously later if needed
      const channelId = 'anonymous';
      const channel = supabase.channel(`user:${channelId}`);

      channel
        .on('broadcast', { event: 'new_conversation' }, (payload) => {
          callback(payload.payload.conversation_id, payload.payload.created_by);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Failed to subscribe to new conversations:', error);
      // Return a no-op function instead of throwing
      return () => {};
    }
  }
}
