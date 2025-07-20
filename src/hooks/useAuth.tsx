import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  initialize: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: true,

      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Login error:', error);
            return false;
          }

          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
            return true;
          }

          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      initialize: () => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({
            user: session?.user ?? null,
            isAuthenticated: !!session?.user,
            loading: false
          });
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
          set({
            user: session?.user ?? null,
            isAuthenticated: !!session?.user,
            loading: false
          });
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);