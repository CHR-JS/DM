import React from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import AnimatedNumber from './AnimatedNumber';

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  isLiked, 
  likesCount, 
  onLike,
  size = 'md'
}) => {
  const { user } = useAuthStore();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <button 
      onClick={onLike}
      disabled={!user}
      className={`flex items-center gap-2 ${
        isLiked 
          ? 'text-red-500' 
          : 'text-gray-600 hover:text-red-500'
      } transition-colors disabled:opacity-50 disabled:cursor-not-allowed group`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isLiked ? 'liked' : 'unliked'}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Heart 
            className={`${sizeClasses[size]} transform group-hover:scale-110 transition-transform`}
            fill={isLiked ? "currentColor" : "none"}
          />
        </motion.div>
      </AnimatePresence>
      <AnimatedNumber value={likesCount} />
    </button>
  );
};

export default LikeButton;