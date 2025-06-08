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

export interface Participant {
  userId: string;
  username: string;
  avatarUrl: string | null;
}

interface ConversationParticipant {
  user_id: string;
  username: string;
  avatar_url: string | null;
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

    try {
      // Create conversation with participants using the new function
      const { data: conversationId, error } = await supabase
        .rpc<string, { p_creator_id: string; p_participant_ids: string[] }>('create_conversation_with_participants', {
          p_creator_id: userData.user.id,
          p_participant_ids: participantIds
        });

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }

      // Get the created conversation
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (fetchError) {
        console.error('Error fetching created conversation:', fetchError);
        throw fetchError;
      }

      // Notify other participants
      for (const participantId of participantIds) {
        if (participantId !== userData.user.id) {
          const channel = supabase.channel(`user:${participantId}`);
          await channel.send({
            type: 'broadcast',
            event: 'new_conversation',
            payload: {
              conversation_id: conversationId,
              created_by: userData.user.id
            }
          });
        }
      }

      return conversation;
    } catch (error) {
      console.error('Error in createConversation:', error);
      throw error;
    }
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
  static async getConversationParticipants(conversationId: string): Promise<Participant[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_conversation_participants', {
          conversation_id: conversationId
        });

      if (error) {
        console.error('Error fetching participants:', error);
        return [];
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data.map((p: ConversationParticipant) => ({
        userId: p.user_id,
        username: p.username || '',
        avatarUrl: p.avatar_url || null
      }));
    } catch (error) {
      console.error('Error in getConversationParticipants:', error);
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
