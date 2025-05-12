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

export const signUpWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'lynk://auth/callback',
        data: {
          email_confirmed: false,
        },
      },
    });

    if (error) throw error;

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
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred. Please check your internet connection.',
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

