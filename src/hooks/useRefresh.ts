import { useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';
import { useMatchStore } from '../store/matchStore';
import toast from 'react-hot-toast';

export function useRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuthStore();
  const { loadMatches, loadLikedProfiles } = useMatchStore();
  const { loadPosts } = usePostStore();

  const refresh = useCallback(async (page: 'discover' | 'social' | 'chat' | 'profile' | 'map') => {
    if (!user || isRefreshing) return;

    setIsRefreshing(true);
    try {
      switch (page) {
        case 'discover':
          await loadLikedProfiles(user.id);
          break;
        case 'social':
          await loadPosts();
          break;
        case 'chat':
          await loadMatches(user.id);
          break;
        case 'map':
          // Refresh map data
          break;
        case 'profile':
          // Refresh profile data
          break;
      }
    } catch (error) {
      console.error(`Error refreshing ${page}:`, error);
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setIsRefreshing(false);
    }
  }, [user, isRefreshing]);

  return { isRefreshing, refresh };
}