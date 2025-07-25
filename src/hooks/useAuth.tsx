import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithMobile: (mobile: string, otp: string) => Promise<boolean>;
  sendMobileOTP: (mobile: string) => Promise<{ success: boolean; otp?: string }>;
  logout: () => void;
  initialize: () => void;
  getUserRole: () => 'admin' | 'team' | 'user';
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

      loginWithMobile: async (mobile: string, otp: string) => {
        try {
          // Demo mobile login
          if (mobile === '919891324442' && otp === '1234') {
            const demoUser = {
              id: "demo-user-id",
              email: "user@example.com",
              user_metadata: { role: "user", name: "Demo User", mobile: mobile },
              app_metadata: {},
              aud: "authenticated",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as any;

            set({ user: demoUser, isAuthenticated: true });
            localStorage.setItem('demo-auth', JSON.stringify({
              user: demoUser,
              isAuthenticated: true
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Mobile login error:', error);
          return false;
        }
      },

      sendMobileOTP: async (mobile: string) => {
        try {
          // Demo OTP for specific mobile number
          if (mobile === '919891324442') {
            return { success: true, otp: '1234' };
          }
          return { success: false };
        } catch (error) {
          console.error('Send OTP error:', error);
          return { success: false };
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          localStorage.removeItem('demo-auth');
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      getUserRole: () => {
        const { user } = get();
        if (!user) return 'user';

        // Check for admin/team roles
        const email = user.email?.toLowerCase();
        const role = user.user_metadata?.role;

        if (role === 'admin' || email === 'admin@angelsonearth.com') {
          return 'admin';
        }
        if (role === 'team' || email?.includes('team@')) {
          return 'team';
        }
        return 'user';
      },

      initialize: () => {
        // Check for demo auth first
        const demoAuth = localStorage.getItem('demo-auth');
        if (demoAuth) {
          try {
            const { user, isAuthenticated } = JSON.parse(demoAuth);
            set({
              user,
              isAuthenticated,
              loading: false
            });
            return;
          } catch (error) {
            localStorage.removeItem('demo-auth');
          }
        }

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