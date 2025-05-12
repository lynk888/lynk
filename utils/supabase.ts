import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace these with your actual Supabase credentials
// 1. Go to https://supabase.com and create a project
// 2. Go to Project Settings > API
// 3. Copy the Project URL and anon key from there
const supabaseUrl = 'https://jpirmkxxnzycatxgphel.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwaXJta3h4bnp5Y2F0eGdwaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDk0MzcsImV4cCI6MjA2MjYyNTQzN30.y-kpjqj8SLr1QENHyVq85NgJ-m4zApaOPwrOOi-Rwb0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 