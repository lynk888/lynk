import EncryptedStorage from 'react-native-encrypted-storage';

export const SecureStorage = {
  async storeToken(token: string) {
    try {
      await EncryptedStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await EncryptedStorage.getItem('auth_token');
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
    }
  }
};
