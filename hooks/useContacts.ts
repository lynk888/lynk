import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Contact, ContactService } from '../services/contactService';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ContactService.getContacts();
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contacts'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Subscribe to contact updates
  useEffect(() => {
    // Create a channel for contact notifications
    const channel = supabase.channel('user_contacts');

    channel
      .on('broadcast', { event: 'contact_updated' }, () => {
        // Refetch contacts when any change occurs
        fetchContacts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContacts]);

  // Add a new contact
  const addContact = useCallback(async (contactId: string, displayName: string) => {
    try {
      const contact = await ContactService.addContact(contactId, displayName);
      if (contact) {
        // Refetch contacts to include the new one
        fetchContacts();
      }
      return contact;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add contact'));
      return null;
    }
  }, [fetchContacts]);

  // Update a contact's display name
  const updateContactName = useCallback(async (contactId: string, displayName: string) => {
    try {
      await ContactService.updateContactName(contactId, displayName);
      // Update the contact in the state
      setContacts(prev => prev.map(c =>
        c.contact_id === contactId ? { ...c, display_name: displayName } : c
      ));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update contact name'));
    }
  }, []);

  // Delete a contact
  const deleteContact = useCallback(async (contactId: string) => {
    try {
      await ContactService.deleteContact(contactId);
      // Remove the contact from the state
      setContacts(prev => prev.filter(c => c.contact_id !== contactId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete contact'));
    }
  }, []);

  // Search for users to add as contacts
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await ContactService.searchUsers(query);
      setSearchResults(results);
    } catch (err) {
      setSearchError(err instanceof Error ? err : new Error('Failed to search users'));
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Migrate contacts from AsyncStorage to Supabase
  const migrateContacts = useCallback(async () => {
    try {
      await ContactService.migrateContactsFromAsyncStorage();
      // Refetch contacts after migration
      fetchContacts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to migrate contacts'));
    }
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    refreshContacts: fetchContacts,
    addContact,
    updateContactName,
    deleteContact,
    searchUsers,
    searchResults,
    searchLoading,
    searchError,
    migrateContacts
  };
}
