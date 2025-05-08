// Use CommonJS
const zustand = require('zustand/vanilla');

// Create a simple store
const createStore = zustand.createStore;
const store = createStore((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// Log the store
console.log('Store created successfully!');
console.log('Current state:', store.getState());
