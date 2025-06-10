
import { supabase } from '../utils/supabase';

export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
}

export class UserService {
  /**
   * Check if a string is a valid UUID
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Find a user by email
   */
  static async findUserByEmail(email: string): Promise<User | null> {
    if (!email || !email.includes('@')) {
      console.error('Invalid email format');
      return null;
    }

    try {
      // First, try to find the user in the profiles table directly
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, avatar_url')
        .ilike('email', email) // Case-insensitive match
        .limit(1);

      if (!error && data && data.length > 0) {
        // Validate that the user ID is a valid UUID
        if (!this.isValidUUID(data[0].id)) {
          console.error(`Invalid UUID format for user: ${data[0].id}`);
          return null;
        }
        return data[0];
      }

      // If not found directly, try using the Edge Function (if available)
      try {
        const { data: userData, error: userError } = await supabase
          .functions.invoke('find-user-by-email', {
            body: { email }
          });

        if (!userError && userData && userData.user) {
          return userData.user;
        }
      } catch (funcError) {
        // Edge function might not be available, just log and continue
        console.log('Edge function not available or error:', funcError);
      }

      // If we get here, the user wasn't found
      console.log('No user found with email:', email);
      return null;
    } catch (err) {
      console.error('Error finding user by email:', err);
      return null;
    }
  }

  /**
   * Add a user to contacts
   */
  static async addContact(contactId: string, displayName: string): Promise<void> {
    // Validate UUID format
    if (!this.isValidUUID(contactId)) {
      throw new Error(`Invalid UUID format: ${contactId}`);
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: userData.user.id,
          contact_id: contactId,
          display_name: displayName
        });

      if (error) throw error;

      // Notify the other user about the new contact
      const channel = supabase.channel(`user:${contactId}`);
      await channel.send({
        type: 'broadcast',
        event: 'new_contact',
        payload: {
          user_id: userData.user.id
        }
      });
    } catch (err) {
      console.error('Error adding contact:', err);
      throw err;
    }
  }

  /**
   * Get current user's contacts
   */
  static async getContacts(): Promise<User[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('contacts')
        .select(`
          contact_id,
          display_name,
          profiles:contact_id(id, email, username, avatar_url)
        `)
        .eq('user_id', userData.user.id);

      if (error) {
        if (error.message.includes('relation "public.profiles" does not exist')) {
          console.log('Profiles table does not exist yet. Returning basic contact info.');

          // If profiles table doesn't exist, just return contact IDs
          const { data: basicData, error: basicError } = await supabase
            .from('contacts')
            .select('contact_id, display_name')
            .eq('user_id', userData.user.id);

          if (basicError) throw basicError;

          return basicData?.map(item => ({
            id: item.contact_id,
            email: '', // Default empty email for basic data
            display_name: item.display_name
          })) || [];
        }
        throw error;
      }

      // Filter out any contacts with invalid UUIDs and map to User objects
      return data
        .filter(item => item.profiles && this.isValidUUID(item.profiles.id))
        .map(item => ({
          id: item.profiles.id,
          email: item.profiles.email || '',
          username: item.profiles.username,
          avatar_url: item.profiles.avatar_url,
          display_name: item.display_name
        }));
    } catch (err) {
      console.error('Error getting contacts:', err);
      return [];
    }
  }

  /**
   * Subscribe to new contact notifications
   */
  static subscribeToContactNotifications(
    callback: (userId: string) => void
  ): () => void {
    try {
      // Create a generic channel ID
      // We'll get the user ID asynchronously later if needed
      const channelId = 'anonymous';
      const channel = supabase.channel(`user:${channelId}`);

      channel
        .on('broadcast', { event: 'new_contact' }, (payload) => {
          // Validate the user ID before calling the callback
          const userId = payload.payload.user_id;
          if (this.isValidUUID(userId)) {
            callback(userId);
          } else {
            console.error(`Received invalid UUID in contact notification: ${userId}`);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Failed to subscribe to contact notifications:', error);
      // Return a no-op function instead of throwing
      return () => {};
    }
  }
}
