import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Flag, EyeOff, Trash2, Link2, X } from 'lucide-react';
import { Post } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { usePostStore } from '../../store/postStore';
import { motion, AnimatePresence } from 'framer-motion';
import MediaViewer from '../common/MediaViewer';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuthStore();
  const { likePost, deletePost, hidePost, reportPost, incrementShares } = usePostStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (!user) {
      toast.error('Connectez-vous pour aimer ce post');
      return;
    }
    try {
      await likePost(post.id, user.id);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Une erreur est survenue');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Partager la publication',
          text: post.content,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié !');
      }
      await incrementShares(post.id);
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Erreur lors du partage');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Une erreur est survenue');
    }
    setShowMenu(false);
  };

  const handleHide = async () => {
    try {
      await hidePost(post.id);
    } catch (error) {
      console.error('Error hiding post:', error);
      toast.error('Une erreur est survenue');
    }
    setShowMenu(false);
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Veuillez indiquer une raison');
      return;
    }

    try {
      await reportPost(post.id, reportReason);
      setShowReportDialog(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Une erreur est survenue');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
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

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>

          {/* Menu Dropdown */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-10"
              >
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Lien copié !');
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Copier le lien
                </button>
                
                <button
                  onClick={handleHide}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  Masquer
                </button>
                
                <button
                  onClick={() => {
                    setShowReportDialog(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Flag className="w-4 h-4" />
                  Signaler
                </button>

                {user?.id === post.userId && (
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4">
        <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Media Grid */}
        {post.images && post.images.length > 0 && (
          <div 
            className={`grid gap-2 mb-4 ${
              post.images.length === 1 ? 'grid-cols-1' :
              post.images.length === 2 ? 'grid-cols-2' :
              post.images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
            }`}
          >
            {post.images.map((image, index) => (
              <div
                key={index}
                className={`relative cursor-pointer group ${
                  post.images.length === 3 && index === 0 ? 'row-span-2' : ''
                }`}
                onClick={() => {
                  setSelectedMediaIndex(index);
                  setShowMediaViewer(true);
                }}
              >
                <img
                  src={image}
                  alt={`Post ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${
              post.likes.includes(user?.id || 0)
                ? 'text-red-500'
                : 'text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart
              className="w-6 h-6"
              fill={post.likes.includes(user?.id || 0) ? "currentColor" : "none"}
            />
            <span className="text-sm font-medium">{post.likes.length}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-medium">{post.comments.length}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-sm font-medium">{post.shares}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t"
          >
            <CommentSection post={post} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Viewer */}
      {showMediaViewer && (
        <MediaViewer
          media={post.images.map(url => ({ type: 'image', url }))}
          initialIndex={selectedMediaIndex}
          onClose={() => setShowMediaViewer(false)}
        />
      )}

      {/* Report Dialog */}
      <AnimatePresence>
        {showReportDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowReportDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Signaler la publication</h3>
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Sélectionnez une raison</option>
                <option value="spam">Spam</option>
                <option value="inappropriate">Contenu inapproprié</option>
                <option value="harassment">Harcèlement</option>
                <option value="violence">Violence</option>
                <option value="other">Autre</option>
              </select>
              
              {reportReason === 'other' && (
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Précisez la raison..."
                  className="w-full p-2 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReport}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Signaler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostCard;