// Import from our custom store implementation instead of directly from zustand
import { create } from './customStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import persist middleware but we'll use a modified version that doesn't use import.meta
import { createJSONStorage } from 'zustand/middleware';

interface UserState {
  user: {
    id: string | null;
    email: string | null;
  };
  isLoading: boolean;
  setUser: (user: UserState['user']) => void;
  clearUser: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

// Create a simple store without the persist middleware to avoid import.meta issues
export const useUserStore = create<UserState>((set) => ({
  user: {
    id: null,
    email: null,
  },
  isLoading: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: { id: null, email: null } }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

