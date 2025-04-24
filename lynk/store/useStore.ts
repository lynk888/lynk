import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

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

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: {
        id: null,
        email: null,
      },
      isLoading: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: { id: null, email: null } }),
      setIsLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

