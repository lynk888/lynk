import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Get environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if configuration exists
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
}

// Use environment variables properly
const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
