// Custom store implementation that avoids import.meta issues
import { create as createOriginal, StateCreator, StoreApi } from 'zustand';

// Create a wrapper around the original create function
export const create = <T,>(initializer: StateCreator<T>) => {
  // Use the original create function but intercept any middleware that might use import.meta
  return createOriginal<T>((set, get, api) => {
    return initializer(set, get, api);
  });
};

// Export a simple store creator that doesn't use devtools middleware
export const createSimpleStore = <T extends object>(initialState: T) => {
  return create<T & { setState: (newState: Partial<T>) => void }>((set) => ({
    ...initialState,
    setState: (newState) => set((state) => ({ ...state, ...newState })),
  }));
};
