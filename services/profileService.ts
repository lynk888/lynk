import { supabase } from '../utils/supabase';
import { StorageService } from './storageService';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  email: string;
}

export class ProfileService {
  /**
   * Get the current user's profile
   */
  static async getProfile(): Promise<Profile | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  /**
   * Update the current user's profile
   */
  static async updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userData.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  }

  /**
   * Update the user's avatar
   */
  static async updateAvatar(file: File): Promise<Profile | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    // Upload the new avatar
    const avatarUrl = await StorageService.uploadAvatar(file);
    if (!avatarUrl) return null;

    // Update the profile with the new avatar URL
    return this.updateProfile({ avatar_url: avatarUrl });
  }

  /**
   * Get a user's profile by ID
   */
  static async getProfileById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }
} 