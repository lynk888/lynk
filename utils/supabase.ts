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

// Fallback to hardcoded values if environment variables are not available
const url = supabaseUrl || 'https://jpirmkxxnzycatxgphel.supabase.co';
const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwaXJta3h4bnp5Y2F0eGdwaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDk0MzcsImV4cCI6MjA2MjYyNTQzN30.y-kpjqj8SLr1QENHyVq85NgJ-m4zApaOPwrOOi-Rwb0';

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});