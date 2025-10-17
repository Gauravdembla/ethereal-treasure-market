import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import externalAuthService, { type ExternalUserData, type MembershipTier } from '@/services/externalAuthService';

interface AuthStore {
  user: User | null;
  externalUser: ExternalUserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithMobile: (mobile: string, otp: string) => Promise<boolean>;
  sendMobileOTP: (mobile: string) => Promise<{ success: boolean; otp?: string }>;
  logout: () => void;
  initialize: () => void;
  getUserRole: () => 'admin' | 'team' | 'user';
  getMembershipTier: () => MembershipTier;
  refreshExternalAuth: () => Promise<void>;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      externalUser: null,
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
              email: "gaurav262001@gmail.com",
              user_metadata: { role: "user", name: "Gaurav Dembla", mobile: mobile },
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
          // Clear external auth data
          externalAuthService.clearUserData();

          // Clear Supabase auth
          await supabase.auth.signOut();
          localStorage.removeItem('demo-auth');

          set({
            user: null,
            externalUser: null,
            isAuthenticated: false
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      getUserRole: () => {
        const { user, externalUser } = get();

        // CRITICAL: Admin access based ONLY on specific user ID
        const adminUserId = '66f1851e9b5fc4e6c571a7ab';
        const currentUserId = localStorage.getItem('AOE_userId');

        // Check if current user is the designated admin
        if (currentUserId === adminUserId) {
          return 'admin';
        }

        // For external users, all are regular users regardless of membership tier
        if (externalUser) {
          return 'user';
        }

        // Fallback to existing user role logic for non-external users
        if (!user) return 'user';

        const email = user.email?.toLowerCase();
        const role = user.user_metadata?.role;

        if (role === 'admin' || email === 'gaurav262001@gmail.com') {
          return 'admin';
        }
        if (role === 'team' || email?.includes('team@')) {
          return 'team';
        }
        return 'user';
      },

      initialize: async () => {
        set({ loading: true });

        try {
          // First, try to initialize external authentication
          const externalUser = await externalAuthService.initialize();

          if (externalUser) {
            // User is authenticated via external system
            set({
              externalUser,
              isAuthenticated: true,
              loading: false,
              user: null // We don't use Supabase user for external auth
            });
            return;
          }

          // Fallback to existing auth systems
          // Check for demo auth
          const demoAuth = localStorage.getItem('demo-auth');
          if (demoAuth) {
            try {
              const { user, isAuthenticated } = JSON.parse(demoAuth);
              set({
                user,
                isAuthenticated,
                loading: false,
                externalUser: null
              });
              return;
            } catch (error) {
              localStorage.removeItem('demo-auth');
            }
          }

          // Get initial Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          set({
            user: session?.user ?? null,
            isAuthenticated: !!session?.user,
            loading: false,
            externalUser: null
          });

          // Listen for auth changes
          supabase.auth.onAuthStateChange((event, session) => {
            const { externalUser } = get();
            if (!externalUser) { // Only update if not using external auth
              set({
                user: session?.user ?? null,
                isAuthenticated: !!session?.user,
                loading: false
              });
            }
          });
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({
            user: null,
            externalUser: null,
            isAuthenticated: false,
            loading: false
          });
        }
      },

      refreshExternalAuth: async () => {
        try {
          const externalUser = await externalAuthService.initialize();
          if (externalUser) {
            set({ externalUser, isAuthenticated: true });
          }
        } catch (error) {
          console.error('Error refreshing external auth:', error);
        }
      },

      getMembershipTier: () => {
        const { externalUser } = get();
        if (externalUser?.membership_tier) {
          return externalAuthService.getMembershipTierInfo(externalUser.membership_tier);
        }
        return externalAuthService.getMembershipTierInfo('none');
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