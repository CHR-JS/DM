import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32
  };

  return (
    <motion.div 
      className="flex items-center gap-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        className="relative"
      >
        <div className="relative">
          <MessageCircle
            size={iconSizes[size]}
            className="text-purple-600"
            strokeWidth={2.5}
          />
          <Heart
            size={iconSizes[size] / 2}
            className="absolute bottom-0 right-0 text-pink-500"
            fill="currentColor"
          />
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 opacity-50 blur-lg -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      {showText && (
        <motion.span
          className={`font-bold ${sizeClasses[size]} bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          DM
        </motion.span>
      )}
    </motion.div>
  );
};

export default Logo;