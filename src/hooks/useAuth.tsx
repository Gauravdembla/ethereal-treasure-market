import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  login: () => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  login: () => {
    // Mock login - replace with real authentication
    set({ 
      user: { 
        id: '1', 
        name: 'Sarah Angel', 
        email: 'sarah@example.com' 
      } 
    });
  },
  logout: () => set({ user: null }),
}));