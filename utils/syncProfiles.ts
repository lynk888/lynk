import { supabase } from './supabase';

/**
 * Utility function to sync the current user's profile
 * This can be called after login to ensure the profile exists
 */
export const syncCurrentUserProfile = async (): Promise<boolean> => {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error('Error getting current user:', userError);
      return false;
    }
    
    const user = userData.user;
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileError);
    }
    
    // If profile doesn't exist, create it
    if (!profile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          username: user.user_metadata.username || (user.email ? user.email.split('@')[0] : 'user'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
        return false;
      }
      
      console.log('Profile created successfully');
      return true;
    }
    
    // Profile exists, check if it needs updating
    if (profile.email !== user.email || !profile.username) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email: user.email,
          username: profile.username || user.user_metadata.username || user.email?.split('@')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        return false;
      }
      
      console.log('Profile updated successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing profile:', error);
    return false;
  }
};
