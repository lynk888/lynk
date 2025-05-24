import { supabase } from '../utils/supabase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  attachment_url?: string;
  attachment_type?: string;
  isSent?: boolean; // Client-side property for UI rendering
  is_read?: boolean; // Whether the message has been read
}

export class MessageService {
  /**
   * Send a message to a conversation
   */
  static async sendMessage(
    conversationId: string,
    content: string,
    attachmentUrl?: string,
    attachmentType?: string
  ): Promise<Message | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userData.user.id,
        content,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType
      })
      .select()
      .single();

    if (error) throw error;

    // Create message status for all participants
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId);

    if (participants) {
      const statusInserts = participants.map(p => ({
        message_id: data.id,
        user_id: p.user_id,
        is_read: p.user_id === userData.user.id // Mark as read for sender
      }));

      await supabase.from('message_status').insert(statusInserts);
    }

    // Broadcast the new message to the conversation channel
    const channel = supabase.channel(`conversation:${conversationId}`);
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: data
    });

    return data;
  }

  /**
   * Get messages for a conversation with pagination
   */
  static async getMessages(
    conversationId: string,
    limit = 50,
    before?: string
  ): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Mark a message as read
   */
  static async markAsRead(messageId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase
      .from('message_status')
      .upsert({
        message_id: messageId,
        user_id: userData.user.id,
        read_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  /**
   * Mark all messages in a conversation as read
   */
  static async markAllAsRead(conversationId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    try {
      // Get all messages in the conversation that are not sent by the current user
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', userData.user.id);

      if (messagesError) throw messagesError;
      if (!messages || messages.length === 0) return;

      // Get existing read statuses for this user
      const messageIds = messages.map(m => m.id);
      let existingStatuses: { message_id: string }[] = [];

      if (messageIds.length > 0) {
        const { data: statusData, error: statusError } = await supabase
          .from('message_status')
          .select('message_id')
          .eq('user_id', userData.user.id)
          .in('message_id', messageIds)
          .not('read_at', 'is', null);

        if (statusError) throw statusError;
        existingStatuses = statusData || [];
      }

      // Filter out messages that are already marked as read
      const readMessageIds = new Set(existingStatuses.map(s => s.message_id));
      const unreadMessages = messages.filter(m => !readMessageIds.has(m.id));

      if (unreadMessages.length === 0) return;

      // Create message status entries for all unread messages
      const messageStatuses = unreadMessages.map(message => ({
        message_id: message.id,
        user_id: userData.user.id,
        is_read: true,
        read_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('message_status')
        .upsert(messageStatuses, { onConflict: 'message_id,user_id' });

      if (error) throw error;
    } catch (err) {
      console.error('Error marking messages as read:', err);
      throw err;
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  }

  /**
   * Subscribe to new messages in a conversation
   */
  static subscribeToMessages(
    conversationId: string,
    onNewMessage: (message: Message) => void,
    onMessagesRead: (userId: string, messageIds: string[]) => void
  ): () => void {
    const channel = supabase.channel(`conversation:${conversationId}`);

    channel
      .on('broadcast', { event: 'new_message' }, (payload) => {
        onNewMessage(payload.payload);
      })
      .on('broadcast', { event: 'messages_read' }, (payload) => {
        onMessagesRead(payload.payload.user_id, payload.payload.message_ids);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
