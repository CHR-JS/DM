import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { usePostStore } from '../../store/postStore';
import { Post } from '../../types';
import { Send, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  post: Post;
}

const CommentSection: React.FC<CommentSectionProps> = ({ post }) => {
  const { user } = useAuthStore();
  const { addComment } = usePostStore();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = {
        id: Date.now(),
        userId: user.id,
        content: newComment.trim(),
        timestamp: new Date(),
        likes: []
      };
      
      await addComment(post.id, comment);
      setNewComment('');
      toast.success('Commentaire ajouté');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}j`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return 'À l\'instant';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {post.comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-start gap-3"
            >
              <img
                src={comment.userId === user?.id ? user.photo : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <h4 className="font-medium">
                    {comment.userId === user?.id ? user.name : "Utilisateur"}
                  </h4>
                  <p className="text-gray-800">{comment.content}</p>
                </div>
                <div className="flex items-center gap-4 mt-1 px-2">
                  <button
                    className={`text-sm font-medium ${
                      comment.likes.includes(user?.id || 0)
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-red-500'
                    } transition-colors`}
                  >
                    J'aime
                  </button>
                  <button className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                    Répondre
                  </button>
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(comment.timestamp)}
                  </span>
                  {comment.likes.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                      {comment.likes.length}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Comment Input */}
      {user && (
        <form onSubmit={handleSubmit} className="flex items-start gap-3 mt-4">
          <img
            src={user.photo}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full px-4 py-2 pr-12 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-600 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentSection;