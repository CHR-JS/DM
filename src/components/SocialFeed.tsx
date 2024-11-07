import React, { useState, useEffect } from 'react';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Loader2, TrendingUp, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LikeButton from './common/LikeButton';
import MediaViewer from './common/MediaViewer';
import PostCreator from './Social/PostCreator';
import toast from 'react-hot-toast';

type FeedFilter = 'trending' | 'recent' | 'following';

const SocialFeed: React.FC = () => {
  const { user } = useAuthStore();
  const { posts, fetchPosts, likePost, addComment } = usePostStore();
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url: string }[] | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FeedFilter>('trending');
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
      {user && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <PostCreator onPostCreated={loadPosts} />
        </div>
      )}

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
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* Post Content */}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={post.author.photo}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{post.author.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="mb-4">{post.content}</p>

                {/* Media Grid */}
                {post.images && post.images.length > 0 && (
                  <div className="grid gap-2 mb-4">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post ${index + 1}`}
                        className="w-full rounded-lg cursor-pointer"
                        onClick={() => setSelectedMedia([{ type: 'image', url: image }])}
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 mt-4">
                  <LikeButton
                    isLiked={user ? post.likes.includes(user.id) : false}
                    likesCount={post.likes.length}
                    onLike={() => user && likePost(post.id, user.id)}
                  />
                  <button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments.length}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600">
                    <Share2 className="w-5 h-5" />
                    <span>{post.shares}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Media Viewer */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          initialIndex={selectedMediaIndex}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
};

export default SocialFeed;