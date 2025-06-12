import EncryptedStorage from 'react-native-encrypted-storage';

export const SecureStorage = {
  async storeToken(token: string) {
    try {
      if (!token) {
        throw new Error('Token cannot be empty');
      }
      await EncryptedStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
      // Rethrow to allow proper error handling upstream
      throw error;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const token = await EncryptedStorage.getItem('auth_token');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async removeToken() {
    try {
      await EncryptedStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing token:', error);
      // Rethrow to allow proper error handling upstream
      throw error;
    }
  },

  // Add cleanup method
  async cleanup() {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      console.error('Error during storage cleanup:', error);
      throw error;
    }
  }
};
