import { create } from 'zustand';
import { Post, Comment } from '../types';
import { MOCK_POSTS } from '../lib/mockPosts';
import { logError } from '../utils/errorHandling';
import toast from 'react-hot-toast';

interface PostState {
  posts: Post[];
  hiddenPosts: number[];
  fetchPosts: (filter?: 'trending' | 'recent' | 'following') => Promise<void>;
  addPost: (post: Post) => void;
  deletePost: (postId: number) => Promise<void>;
  hidePost: (postId: number) => Promise<void>;
  reportPost: (postId: number, reason: string) => Promise<void>;
  likePost: (postId: number, userId: number) => Promise<void>;
  addComment: (postId: number, comment: Comment) => Promise<void>;
  incrementShares: (postId: number) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: MOCK_POSTS,
  hiddenPosts: [],
  
  fetchPosts: async (filter = 'trending') => {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredPosts = [...MOCK_POSTS];
      const { hiddenPosts } = get();
      
      // Filtrer les posts masqués
      filteredPosts = filteredPosts.filter(post => !hiddenPosts.includes(post.id));
      
      switch (filter) {
        case 'trending':
          filteredPosts.sort((a, b) => (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length));
          break;
        case 'recent':
          filteredPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          break;
        case 'following':
          // Dans une vraie app, filtrer par utilisateurs suivis
          break;
      }
      
      set({ posts: filteredPosts });
    } catch (error) {
      throw logError(error, 'PostStore:fetchPosts');
    }
  },
  
  addPost: (post) => {
    set((state) => ({
      posts: [post, ...state.posts]
    }));
  },
  
  deletePost: async (postId) => {
    try {
      set((state) => ({
        posts: state.posts.filter(post => post.id !== postId)
      }));
      toast.success('Publication supprimée');
    } catch (error) {
      throw logError(error, 'PostStore:deletePost');
    }
  },
  
  hidePost: async (postId) => {
    try {
      set((state) => ({
        hiddenPosts: [...state.hiddenPosts, postId],
        posts: state.posts.filter(post => post.id !== postId)
      }));
      toast.success('Publication masquée');
    } catch (error) {
      throw logError(error, 'PostStore:hidePost');
    }
  },
  
  reportPost: async (postId, reason) => {
    try {
      // Dans une vraie app, envoyer le signalement au serveur
      console.log('Post reported:', { postId, reason });
      
      // Masquer automatiquement le post signalé
      set((state) => ({
        hiddenPosts: [...state.hiddenPosts, postId],
        posts: state.posts.filter(post => post.id !== postId)
      }));
      toast.success('Publication signalée');
    } catch (error) {
      throw logError(error, 'PostStore:reportPost');
    }
  },
  
  likePost: async (postId, userId) => {
    try {
      set((state) => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            const likes = post.likes.includes(userId)
              ? post.likes.filter(id => id !== userId)
              : [...post.likes, userId];
            return { ...post, likes };
          }
          return post;
        })
      }));
    } catch (error) {
      throw logError(error, 'PostStore:likePost');
    }
  },
  
  addComment: async (postId, comment) => {
    try {
      set((state) => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, comment]
            };
          }
          return post;
        })
      }));
    } catch (error) {
      throw logError(error, 'PostStore:addComment');
    }
  },
  
  incrementShares: async (postId) => {
    try {
      set((state) => ({
        posts: state.posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              shares: post.shares + 1
            };
          }
          return post;
        })
      }));
    } catch (error) {
      throw logError(error, 'PostStore:incrementShares');
    }
  }
}));