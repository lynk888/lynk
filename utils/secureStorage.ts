import EncryptedStorage from 'react-native-encrypted-storage';
import { Platform } from 'react-native';

// Safer implementation with better error handling
export const SecureStorage = {
  async storeToken(token: string): Promise<boolean> {
    try {
      // Check if token is valid to prevent potential native crashes
      if (!token || typeof token !== 'string') {
        console.warn('Invalid token provided to SecureStorage.storeToken');
        return false;
      }

      await EncryptedStorage.setItem('auth_token', token);
      return true;
    } catch (error) {
      // More detailed error logging
      console.error('Error storing token in SecureStorage:',
        Platform.OS === 'ios' ? 'iOS Error' : 'Android Error',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const token = await EncryptedStorage.getItem('auth_token');
      return token;
    } catch (error) {
      // More detailed error logging
      console.error('Error retrieving token from SecureStorage:',
        Platform.OS === 'ios' ? 'iOS Error' : 'Android Error',
        error instanceof Error ? error.message : String(error)
      );
      return null;
    }
  },

  async removeToken(): Promise<boolean> {
    try {
      await EncryptedStorage.removeItem('auth_token');
      return true;
    } catch (error) {
      // More detailed error logging
      console.error('Error removing token from SecureStorage:',
        Platform.OS === 'ios' ? 'iOS Error' : 'Android Error',
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  }
};
