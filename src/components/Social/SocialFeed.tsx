import React, { useState, useEffect } from 'react';
import { usePostStore } from '../../store/postStore';
import { useAuthStore } from '../../store/authStore';
import PostCard from './PostCard';
import PostCreator from './PostCreator';
import { Loader2, TrendingUp, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

type FeedFilter = 'trending' | 'recent' | 'following';

const SocialFeed: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FeedFilter>('trending');
  const { user } = useAuthStore();
  const { posts, fetchPosts } = usePostStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      await fetchPosts(filter);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Erreur lors du chargement des publications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await loadPosts();
      toast.success('Flux actualisé');
    } catch (error) {
      console.error('Error refreshing feed:', error);
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterButtons: { id: FeedFilter; label: string; icon: typeof TrendingUp }[] = [
    { id: 'trending', label: 'Tendances', icon: TrendingUp },
    { id: 'recent', label: 'Récents', icon: Clock },
    { id: 'following', label: 'Abonnements', icon: Users },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Feed Header */}
      <div className="bg-white rounded-xl shadow-md p-4 sticky top-16 z-10">
        <h2 className="text-xl font-bold mb-4">Social</h2>

        {/* Feed Filters */}
        <div className="flex justify-between">
          {filterButtons.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                filter === id
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Post Creator */}
      {user && <PostCreator onPostCreated={loadPosts} />}

      {/* Posts */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune publication pour le moment
            </div>
          )}
        </div>
      )}

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 z-50">
          <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
          <span className="text-sm font-medium">Actualisation...</span>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;