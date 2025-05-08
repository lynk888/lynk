import { auth, firestore } from '../config/firebaseConfig';

export class FirebaseAuthService {
  static async signUp(email: string, password: string, username: string) {
    try {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create user profile in Firestore
      await setDoc(doc(collection(firestore, 'users'), userCredential.user.uid), {
        email,
        username,
        createdAt: serverTimestamp(),
      });

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  static async signOut() {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }
}


