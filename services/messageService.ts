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
   * Update the database schema
   */
  static async updateDatabaseSchema() {
    try {
      // Check if last_message_id column exists
      const { data: columnInfo, error: columnError } = await supabase
        .from('conversations')
        .select('last_message_id')
        .limit(1);

      if (columnError && columnError.code === '42703') { // Column doesn't exist
        // Add the column using direct SQL
        const { error: alterError } = await supabase.rpc('exec_sql', {
          sql: `
            ALTER TABLE conversations
            ADD COLUMN IF NOT EXISTS last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL;
          `
        });

        if (alterError) {
          console.error('Error adding last_message_id column:', alterError);
          return;
        }

        // Update existing conversations with their latest message
        const { error: updateError } = await supabase.rpc('exec_sql', {
          sql: `
            UPDATE conversations c
            SET last_message_id = (
              SELECT id
              FROM messages m
              WHERE m.conversation_id = c.id
              ORDER BY m.created_at DESC
              LIMIT 1
            );
          `
        });

        if (updateError) {
          console.error('Error updating last_message_ids:', updateError);
        }

        // Create index
        const { error: indexError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE INDEX IF NOT EXISTS idx_conversations_last_message_id 
            ON conversations(last_message_id);
          `
        });

        if (indexError) {
          console.error('Error creating index:', indexError);
        }
      }
    } catch (error) {
      console.error('Error updating database schema:', error);
    }
  }

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
    if (!userData.user) {
      console.error('No authenticated user found when trying to send message');
      return null;
    }

    console.log('Sending message with user:', userData.user.id, 'to conversation:', conversationId);

    try {
      // Start a transaction to ensure all operations succeed or fail together
      const messageData = {
        conversation_id: conversationId,
        sender_id: userData.user.id,
        content,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType
      };

      console.log('Inserting message with data:', messageData);

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Database error when inserting message:', error);
        throw error;
      }
      if (!data) {
        console.error('No data returned from message insert');
        throw new Error('Failed to create message');
      }

      console.log('Message inserted successfully:', data);

      // Update the conversation with the new message info
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          updated_at: new Date().toISOString(),
          last_message_text: content,
          last_message_time: new Date().toISOString(),
          last_message_id: data.id
        })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating conversation:', updateError);
        // Continue even if update fails, as the message was sent
      }

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
      
      // Ensure the channel is subscribed before sending
      await channel
        .on('broadcast', { event: 'new_message' }, () => {})
        .subscribe();

      // Send the message
      await channel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: data
      });

      // Clean up the channel
      supabase.removeChannel(channel);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
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
    let channel: any = null;
    let isSubscribed = false;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 3;
    const RECONNECT_DELAY = 2000;

    const setupChannel = async () => {
      try {
        // Clean up existing channel if any
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
        }

        // Create a new channel
        channel = supabase.channel(`conversation:${conversationId}`, {
          config: {
            broadcast: { self: true }
          }
        });

        // Set up the subscription with proper error handling
        channel
          .on('broadcast', { event: 'new_message' }, (payload: any) => {
            if (payload.payload) {
              onNewMessage(payload.payload);
            }
          })
          .on('broadcast', { event: 'messages_read' }, (payload: any) => {
            if (payload.payload) {
              onMessagesRead(payload.payload.user_id, payload.payload.message_ids);
            }
          })
          .on('disconnect', () => {
            console.log('Channel disconnected, attempting to reconnect...');
            isSubscribed = false;
            attemptReconnect();
          })
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to conversation:', conversationId);
              isSubscribed = true;
              reconnectAttempts = 0; // Reset reconnect attempts on successful subscription
            } else if (status === 'CLOSED') {
              console.log('Channel closed, will attempt to reconnect...');
              isSubscribed = false;
              attemptReconnect();
            } else {
              console.error('Failed to subscribe to conversation:', conversationId, status);
              isSubscribed = false;
              attemptReconnect();
            }
          });
      } catch (error) {
        console.error('Error setting up channel:', error);
        isSubscribed = false;
        attemptReconnect();
      }
    };

    const attemptReconnect = () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }

      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1); // Exponential backoff
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        
        reconnectTimeout = setTimeout(() => {
          setupChannel();
        }, delay);
      } else {
        console.error('Max reconnection attempts reached. Please refresh the page to try again.');
      }
    };

    // Initial setup
    setupChannel();

    // Return cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (channel) {
        console.log('Cleaning up channel for conversation:', conversationId);
        supabase.removeChannel(channel);
        channel = null;
        isSubscribed = false;
      }
    };
  }

  static async sendMessageWithAttachment(
    conversationId: string,
    content: string,
    attachment: {
      url: string;
      type: string;
      fileName: string;
    }
  ): Promise<Message | null> {
    return this.sendMessage(
      conversationId,
      content,
      attachment.url,
      attachment.type
    );
  }
}
