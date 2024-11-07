import { create } from 'zustand';
import { Profile } from '../types';
import { mockAuth } from '../lib/mockAuth';
import { logError } from '../utils/errorHandling';

interface AuthState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  followUser: (userId: number) => Promise<void>;
  unfollowUser: (userId: number) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  login: async (email, password) => {
    try {
      const profile = await mockAuth.signIn(email, password);
      set({ user: profile, isAuthenticated: true });
    } catch (error) {
      throw logError(error, 'Auth:Login');
    }
  },

  loginWithProvider: async (provider) => {
    try {
      const profile = await mockAuth.signInWithProvider(provider);
      set({ user: profile, isAuthenticated: true });
    } catch (error) {
      throw logError(error, 'Auth:LoginWithProvider');
    }
  },

  logout: async () => {
    try {
      await mockAuth.signOut();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      throw logError(error, 'Auth:Logout');
    }
  },

  updateProfile: async (profile) => {
    try {
      set({ user: profile });
    } catch (error) {
      throw logError(error, 'Auth:UpdateProfile');
    }
  },

  followUser: async (userId) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    try {
      set((state) => ({
        user: state.user ? {
          ...state.user,
          following: [...state.user.following, userId]
        } : null
      }));
    } catch (error) {
      throw logError(error, 'Auth:FollowUser');
    }
  },

  unfollowUser: async (userId) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');

    try {
      set((state) => ({
        user: state.user ? {
          ...state.user,
          following: state.user.following.filter(id => id !== userId)
        } : null
      }));
    } catch (error) {
      throw logError(error, 'Auth:UnfollowUser');
    }
  }
}));