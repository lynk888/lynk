import { Platform } from 'react-native';
import { SecureStorage } from './secureStorage';

/**
 * SafeStorage - A wrapper around SecureStorage with additional safeguards
 * 
 * This utility adds extra protection against native crashes by:
 * 1. Adding timeouts to prevent hanging operations
 * 2. Adding retry logic for failed operations
 * 3. Adding additional error handling and logging
 * 4. Providing fallback mechanisms when secure storage fails
 */
export const SafeStorage = {
  /**
   * Store a token with timeout and retry logic
   */
  async storeToken(token: string, maxRetries = 2): Promise<boolean> {
    if (!token || typeof token !== 'string') {
      console.warn('SafeStorage: Invalid token provided');
      return false;
    }

    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // Wrap in a timeout to prevent hanging
        const result = await Promise.race([
          SecureStorage.storeToken(token),
          new Promise<boolean>((resolve) => {
            setTimeout(() => {
              console.warn(`SafeStorage: storeToken timed out after 5000ms (attempt ${retries + 1}/${maxRetries + 1})`);
              resolve(false);
            }, 5000);
          })
        ]);

        if (result) {
          return true;
        }
        
        // If we get here, the operation timed out or failed
        retries++;
        
        if (retries <= maxRetries) {
          console.warn(`SafeStorage: Retrying storeToken (${retries}/${maxRetries})`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('SafeStorage: Error in storeToken:', 
          Platform.OS === 'ios' ? 'iOS Error' : 'Android Error',
          error instanceof Error ? error.message : String(error)
        );
        retries++;
        
        if (retries <= maxRetries) {
          console.warn(`SafeStorage: Retrying storeToken after error (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    // If we've exhausted retries, try to store in memory as a last resort
    console.warn('SafeStorage: Failed to store token securely after all retries, using memory fallback');
    try {
      // This is just a fallback, not meant to be secure
      (global as any).__tempAuthToken = token;
      return true;
    } catch (e) {
      console.error('SafeStorage: Even memory fallback failed', e);
      return false;
    }
  },

  /**
   * Get a token with timeout and retry logic
   */
  async getToken(maxRetries = 2): Promise<string | null> {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // Wrap in a timeout to prevent hanging
        const result = await Promise.race([
          SecureStorage.getToken(),
          new Promise<null>((resolve) => {
            setTimeout(() => {
              console.warn(`SafeStorage: getToken timed out after 5000ms (attempt ${retries + 1}/${maxRetries + 1})`);
              resolve(null);
            }, 5000);
          })
        ]);

        if (result) {
          return result;
        }
        
        // If we get here, the operation timed out or returned null
        retries++;
        
        if (retries <= maxRetries) {
          console.warn(`SafeStorage: Retrying getToken (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('SafeStorage: Error in getToken:', 
          Platform.OS === 'ios' ? 'iOS Error' : 'Android Error',
          error instanceof Error ? error.message : String(error)
        );
        retries++;
        
        if (retries <= maxRetries) {
          console.warn(`SafeStorage: Retrying getToken after error (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    // If we've exhausted retries, try to get from memory as a last resort
    console.warn('SafeStorage: Failed to get token securely after all retries, using memory fallback');
    try {
      return (global as any).__tempAuthToken || null;
    } catch (e) {
      console.error('SafeStorage: Even memory fallback failed', e);
      return null;
    }
  },

  /**
   * Remove a token with timeout and retry logic
   */
  async removeToken(maxRetries = 2): Promise<boolean> {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        // Wrap in a timeout to prevent hanging
        const result = await Promise.race([
          SecureStorage.removeToken(),
          new Promise<boolean>((resolve) => {
            setTimeout(() => {
              console.warn(`SafeStorage: removeToken timed out after 5000ms (attempt ${retries + 1}/${maxRetries + 1})`);
              resolve(false);
            }, 5000);
          })
        ]);

        if (result) {
          // Also clear memory fallback
          try {
            (global as any).__tempAuthToken = null;
          } catch (e) {
            // Ignore errors here
          }
          return true;
        }
        
        // If we get here, the operation timed out or failed
        retries++;
        
        if (retries <= maxRetries) {
          console.warn(`SafeStorage: Retrying removeToken (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('SafeStorage: Error in removeToken:', 
          Platform.OS === 'ios' ? 'iOS Error' : 'Android Error',
          error instanceof Error ? error.message : String(error)
        );
        retries++;
        
        if (retries <= maxRetries) {
          console.warn(`SafeStorage: Retrying removeToken after error (${retries}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    // If we've exhausted retries, at least clear the memory fallback
    console.warn('SafeStorage: Failed to remove token securely after all retries, clearing memory fallback');
    try {
      (global as any).__tempAuthToken = null;
      return true;
    } catch (e) {
      console.error('SafeStorage: Even memory fallback failed', e);
      return false;
    }
  }
};
