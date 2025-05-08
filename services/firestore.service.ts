import { firestore } from '../config/firebaseConfig';
import { UserData } from '../types/index';

export class FirestoreService {
  static async createUserProfile(userId: string, userData: UserData) {
    try {
      const { collection, doc, setDoc, serverTimestamp } = await import('firebase/firestore');

      await setDoc(doc(collection(firestore, 'users'), userId), {
        ...userData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  }

  static async getUserProfile(userId: string) {
    try {
      const { collection, doc, getDoc } = await import('firebase/firestore');

      const docRef = doc(collection(firestore, 'users'), userId);
      const docSnap = await getDoc(docRef);

      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      throw error;
    }
  }

  static async updateUserProfile(userId: string, data: Partial<UserData>) {
    try {
      const { collection, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');

      await updateDoc(doc(collection(firestore, 'users'), userId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  }
}