import { Platform } from 'react-native';

/**
 * Utility to safely execute functions that might throw native exceptions
 * 
 * This is especially useful for wrapping calls to native modules that might
 * throw C++ exceptions or other native errors that can crash the app.
 */
export const NativeExceptionHandler = {
  /**
   * Safely execute a function that might throw a native exception
   * 
   * @param fn The function to execute
   * @param fallbackValue The value to return if the function throws
   * @param context A string describing the context for error logging
   * @returns The result of the function or the fallback value if it throws
   */
  async executeSafely<T>(
    fn: () => Promise<T>,
    fallbackValue: T,
    context: string = 'unknown'
  ): Promise<T> {
    try {
      // Wrap in a timeout to prevent hanging
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Operation timed out after 5000ms in context: ${context}`));
          }, 5000);
        })
      ]);
      
      return result;
    } catch (error) {
      console.error(
        `NativeExceptionHandler: Error in ${context}:`,
        Platform.OS === 'ios' ? 'iOS Error' : 'Android Error',
        error instanceof Error ? error.message : String(error)
      );
      
      return fallbackValue;
    }
  },
  
  /**
   * Safely execute a synchronous function that might throw a native exception
   * 
   * @param fn The function to execute
   * @param fallbackValue The value to return if the function throws
   * @param context A string describing the context for error logging
   * @returns The result of the function or the fallback value if it throws
   */
  executeSync<T>(
    fn: () => T,
    fallbackValue: T,
    context: string = 'unknown'
  ): T {
    try {
      return fn();
    } catch (error) {
      console.error(
        `NativeExceptionHandler: Error in ${context}:`,
        Platform.OS === 'ios' ? 'iOS Error' : 'Android Error',
        error instanceof Error ? error.message : String(error)
      );
      
      return fallbackValue;
    }
  }
};
