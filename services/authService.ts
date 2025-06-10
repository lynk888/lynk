
import { supabase } from '../utils/supabase';
import { DatabaseService } from './databaseService';

interface RegisterUserParams {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  error?: string;
  token?: string;
}

export const registerUser = async ({
  email,
  username,
  password,
}: RegisterUserParams): Promise<RegisterResponse> => {
  try {
    // TODO: Implement Neon registration
    await DatabaseService.createUserProfile('temp-user-id', {
      email,
      username,
      createdAt: Date.now(),
    });

    return {
      success: true,
      token: 'temp-token'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

interface AuthResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export const signUpWithEmail = async (email: string, password: string, username?: string): Promise<AuthResponse> => {
  try {
    // Extract username from email if not provided
    const defaultUsername = username || email.split('@')[0];

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'lynk://auth/callback',
        data: {
          email_confirmed: false,
          username: defaultUsername,
          email: email, // Store email in metadata for easier access
        },
      },
    });

    if (error) throw error;

    // Create a profile record manually as a fallback
    // This is in addition to the database trigger we created
    try {
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            username: defaultUsername,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (profileError) {
          console.log('Profile creation fallback error:', profileError);
          // Continue anyway, as the trigger should handle this
        }
      }
    } catch (profileErr) {
      console.log('Profile creation attempt error:', profileErr);
      // Continue anyway, as this is just a fallback
    }

    return {
      success: true,
      token: data.session?.access_token,
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create account',
    };
  }
};

export const verifyEmail = async (email: string, token: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;

    return {
      success: true,
      token: data.session?.access_token,
    };
  } catch (error: any) {
    console.error('Verification error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify email',
    };
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Ensure profile exists after login
    try {
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: email,
            username: data.user.user_metadata.username || email.split('@')[0],
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (profileError) {
          console.log('Profile sync error after login:', profileError);
          // Continue anyway
        }
      }
    } catch (profileErr) {
      console.log('Profile sync attempt error:', profileErr);
      // Continue anyway
    }

    return {
      success: true,
      token: data.session?.access_token,
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Failed to login',
    };
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Signout error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<RegisterResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'lynk://auth/reset-password',
    });

    if (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send reset password email',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred. Please check your internet connection.',
    };
  }
};

export const updatePassword = async (newPassword: string): Promise<RegisterResponse> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update password',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred. Please check your internet connection.',
    };
  }
};

export const updateUserProfile = async (username: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: { username, email_confirmed: true }
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Profile update error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    };
  }
};
