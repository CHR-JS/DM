import { create } from 'zustand';
import { Profile } from '../types';
import { MOCK_PROFILES } from '../lib/mockData';
import { logError } from '../utils/errorHandling';
import toast from 'react-hot-toast';

interface MatchState {
  likedProfiles: number[];
  matches: Profile[];
  discoveryProfiles: Profile[];
  loadLikedProfiles: (userId: number) => Promise<void>;
  likeProfile: (userId: number, targetId: number) => Promise<boolean>;
  unlikeProfile: (userId: number, targetId: number) => Promise<void>;
  loadMatches: (userId: number) => Promise<void>;
  loadDiscoveryProfiles: () => Promise<void>;
  removeFromDiscovery: (profileId: number) => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  likedProfiles: [],
  matches: [],
  discoveryProfiles: [],

  loadLikedProfiles: async (userId: number) => {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ likedProfiles: [2] });
    } catch (error) {
      throw logError(error, 'MatchStore:loadLikedProfiles');
    }
  },

  likeProfile: async (userId: number, targetId: number) => {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        likedProfiles: [...state.likedProfiles, targetId],
        matches: [...state.matches, MOCK_PROFILES.find(p => p.id === targetId)!]
      }));

      // 30% de chance d'avoir un match
      return Math.random() < 0.3;
    } catch (error) {
      throw logError(error, 'MatchStore:likeProfile');
    }
  },

  unlikeProfile: async (userId: number, targetId: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        likedProfiles: state.likedProfiles.filter(id => id !== targetId),
        matches: state.matches.filter(match => match.id !== targetId)
      }));
    } catch (error) {
      throw logError(error, 'MatchStore:unlikeProfile');
    }
  },

  loadMatches: async (userId: number) => {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Prendre 5 profils aléatoires comme matches
      const randomMatches = MOCK_PROFILES
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      
      set({ matches: randomMatches });
    } catch (error) {
      throw logError(error, 'MatchStore:loadMatches');
    }
  },

  loadDiscoveryProfiles: async () => {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mélanger les profils aléatoirement
      const shuffledProfiles = [...MOCK_PROFILES].sort(() => 0.5 - Math.random());
      
      set({ discoveryProfiles: shuffledProfiles });
    } catch (error) {
      throw logError(error, 'MatchStore:loadDiscoveryProfiles');
    }
  },

  removeFromDiscovery: (profileId: number) => {
    set(state => ({
      discoveryProfiles: state.discoveryProfiles.filter(p => p.id !== profileId)
    }));
  }
}));