import { supabase } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  username?: string;
  avatar_url?: string;
  email?: string;
}

export interface Contact {
  id: string;
  user_id: string;
  contact_id: string;
  display_name: string;
  created_at: string;
  profile?: {
    username?: string;
    avatar_url?: string;
    email?: string;
  };
}

export class ContactService {
  /**
   * Check if a string is a valid UUID
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
  /**
   * Add a new contact
   */
  static async addContact(contactId: string, displayName: string): Promise<Contact | null> {
    // Validate UUID format
    if (!this.isValidUUID(contactId)) {
      throw new Error(`Invalid UUID format: ${contactId}`);
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: userData.user.id,
        contact_id: contactId,
        display_name: displayName
      })
      .select()
      .single();

    if (error) throw error;

    // Broadcast contact update
    const channel = supabase.channel('user_contacts');
    await channel.send({
      type: 'broadcast',
      event: 'contact_updated',
      payload: {
        user_id: userData.user.id,
        contact_id: contactId
      }
    });

    // Notify the other user about the new contact
    const userChannel = supabase.channel(`user:${contactId}`);
    await userChannel.send({
      type: 'broadcast',
      event: 'new_contact',
      payload: {
        user_id: userData.user.id
      }
    });

    return data;
  }

  /**
   * Get all contacts for the current user
   */
  static async getContacts(): Promise<Contact[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        profile:contact_id(username, avatar_url, email)
      `)
      .eq('user_id', userData.user.id);

    if (error) throw error;
    return data || [];
  }

  /**
   * Update a contact's display name
   */
  static async updateContactName(contactId: string, displayName: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase
      .from('contacts')
      .update({ display_name: displayName })
      .eq('user_id', userData.user.id)
      .eq('contact_id', contactId);

    if (error) throw error;

    // Broadcast contact update
    const channel = supabase.channel('user_contacts');
    await channel.send({
      type: 'broadcast',
      event: 'contact_updated',
      payload: {
        user_id: userData.user.id,
        contact_id: contactId
      }
    });
  }

  /**
   * Delete a contact
   */
  static async deleteContact(contactId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('user_id', userData.user.id)
      .eq('contact_id', contactId);

    if (error) throw error;

    // Broadcast contact update
    const channel = supabase.channel('user_contacts');
    await channel.send({
      type: 'broadcast',
      event: 'contact_updated',
      payload: {
        user_id: userData.user.id,
        contact_id: contactId,
        deleted: true
      }
    });
  }

  /**
   * Search for users to add as contacts
   */
  static async searchUsers(query: string): Promise<User[]> {
    if (!query || query.length < 3) {
      return [];
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.warn('No authenticated user found');
      return [];
    }

    try {
      // First try to search by exact email if query looks like an email
      if (query.includes('@')) {
        const { data: exactMatch, error: exactError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, email')
          .ilike('email', query)
          .neq('id', userData.user.id)
          .limit(1);

        if (exactError) {
          console.error('Error searching for exact email match:', exactError);
        } else if (exactMatch && exactMatch.length > 0) {
          return exactMatch;
        }
      }

      // Then try partial match on username and email
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, email')
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', userData.user.id)
        .limit(10);

      if (error) {
        if (error.message.includes('relation "public.profiles" does not exist')) {
          console.warn('Profiles table does not exist yet. Please run database migrations.');
          return [];
        }
        console.error('Error searching users:', error);
        return [];
      }

      // Filter out any results with invalid UUIDs
      return (data || []).filter(user => this.isValidUUID(user.id));
    } catch (err) {
      console.error('Unexpected error searching users:', err);
      return [];
    }
  }

  /**
   * Migrate existing contacts from AsyncStorage to Supabase
   */
  static async migrateContactsFromAsyncStorage(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    try {
      // Get contacts from AsyncStorage
      const contactsJson = await AsyncStorage.getItem('contacts');
      if (!contactsJson) return;

      const contacts = JSON.parse(contactsJson);

      // For each contact, check if they exist in the database
      for (const [contactId, contactData] of Object.entries(contacts)) {
        // Add type assertion to contactData
        const typedContactData = contactData as { name: string };

        // Skip if contactId is not a valid UUID
        if (!this.isValidUUID(contactId)) {
          console.log(`Skipping contact with invalid UUID: ${contactId}`);
          continue;
        }

        // We'll skip the profile check and creation since the profiles table might not exist yet
        // Just proceed with creating the contact

        try {
          // Check if user exists in auth.users
          const { data: userExists, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', contactId)
            .single();

          if (userError) {
            if (userError.message.includes('relation "public.profiles" does not exist')) {
              console.log('Profiles table does not exist yet. Skipping profile check.');
              // Continue with contact creation
            } else if (userError.code !== 'PGRST116') {
              console.error(`Error checking if user exists: ${userError.message}`);
              // Continue anyway
            }
          }

          // If user doesn't exist and profiles table exists, create a temporary profile
          if (!userExists && !userError?.message.includes('relation "public.profiles" does not exist')) {
            try {
              const { error: createProfileError } = await supabase
                .from('profiles')
                .insert({
                  id: contactId,
                  username: typedContactData.name,
                  created_at: new Date().toISOString()
                });

              if (createProfileError) {
                console.error(`Error creating profile: ${createProfileError.message}`);
                // Continue anyway
              }
            } catch (err) {
              console.error('Error creating profile:', err);
              // Continue anyway
            }
          }
        } catch (err) {
          console.error('Error in profile check/creation:', err);
          // Continue anyway
        }

        // Check if contact already exists
        const { data: contactExists, error: contactError } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', userData.user.id)
          .eq('contact_id', contactId)
          .single();

        if (contactError && contactError.code !== 'PGRST116') {
          console.error(`Error checking if contact exists: ${contactError.message}`);
          continue;
        }

        // If contact doesn't exist, create it
        if (!contactExists) {
          const { error: createContactError } = await supabase
            .from('contacts')
            .insert({
              user_id: userData.user.id,
              contact_id: contactId,
              display_name: typedContactData.name
            });

          if (createContactError) {
            console.error(`Error creating contact: ${createContactError.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Error migrating contacts:', error);
    }
  }
}