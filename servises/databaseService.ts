import { supabase } from '../utils/supabase';

export class DatabaseService {
  static async createUserProfile(userId: string, userData: { email: string; username: string; createdAt: number }) {
    const { error } = await supabase
      .from('profiles')
      .insert([{ id: userId, ...userData }]);

    if (error) throw error;
  }
} 