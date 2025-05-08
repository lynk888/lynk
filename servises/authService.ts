import { auth } from '../config/firebaseConfig';
import { DatabaseService } from './databaseService';

interface RegisterUserParams {
  email: string;
  username: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export const registerUser = async ({
  email,
  username,
  // password is not used in this implementation
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

export const loginUser = async (email: string, password: string): Promise<RegisterResponse> => {
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      token: userCredential.user.uid
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

export const signOut = async (): Promise<void> => {
  const { signOut: firebaseSignOut } = await import('firebase/auth');
  await firebaseSignOut(auth);
};

