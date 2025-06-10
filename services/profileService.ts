import { supabase } from '../utils/supabase';
import { StorageService } from './storageService';
// import { BlockingService } from './blockingService'; // Temporarily disabled

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  email: string;
  bio?: string;
  interests?: string[];
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
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
   * Get a user's profile by ID (with blocking check)
   */
  static async getProfileById(userId: string): Promise<Profile | null> {
    try {
      // Check if user is blocked or has blocked current user (temporarily disabled)
      // const [isBlocked, isBlockedBy] = await Promise.all([
      //   BlockingService.isUserBlocked(userId),
      //   BlockingService.isBlockedBy(userId)
      // ]);

      // if (isBlocked || isBlockedBy) {
      //   throw new Error('Profile access restricted');
      // }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          email,
          avatar_url,
          bio,
          interests,
          is_online,
          last_seen,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Profile not found
        }
        throw error;
      }

      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  }

  /**
   * Check if profile is accessible (not blocked)
   */
  static async isProfileAccessible(userId: string): Promise<boolean> {
    try {
      // Blocking check temporarily disabled
      // const [isBlocked, isBlockedBy] = await Promise.all([
      //   BlockingService.isUserBlocked(userId),
      //   BlockingService.isBlockedBy(userId)
      // ]);

      // return !isBlocked && !isBlockedBy;
      return true; // Allow all profiles for now
    } catch (err) {
      console.error('Error checking profile accessibility:', err);
      return false;
    }
  }
} 