import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { X, Heart, Info, MapPin, School, Sparkles } from 'lucide-react';
import { Profile } from '../../types';
import { useMatchStore } from '../../store/matchStore';
import { useAuthStore } from '../../store/authStore';
import MediaViewer from '../common/MediaViewer';
import toast from 'react-hot-toast';

interface SwipeableCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
  onShowDetails: () => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  profile,
  onSwipe,
  onShowDetails
}) => {
  const { user } = useAuthStore();
  const { likeProfile, likedProfiles } = useMatchStore();
  const [isLiked, setIsLiked] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);

  useEffect(() => {
    setIsLiked(likedProfiles.includes(profile.id));
  }, [profile.id, likedProfiles]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    const velocity = direction === 'left' ? -800 : 800;
    
    if (direction === 'right' && user) {
      try {
        const isMatch = await likeProfile(user.id, profile.id);
        if (isMatch) {
          toast.custom((t) => (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-white rounded-xl shadow-lg p-6 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Nouveau match !</h3>
                <p className="text-gray-600">Vous pouvez maintenant discuter avec {profile.name}</p>
              </div>
            </motion.div>
          ), { duration: 4000 });
        }
      } catch (error) {
        console.error('Error liking profile:', error);
        toast.error('Une erreur est survenue');
      }
    }

    // Attendre la fin de l'animation avant de changer de carte
    setTimeout(() => {
      onSwipe(direction);
      x.set(0);
      setSwipeDirection(null);
    }, 200);
  };

  const handlers = useSwipeable({
    onSwiping: (event) => {
      if (!swipeDirection) {
        x.set(event.deltaX);
      }
    },
    onSwipedLeft: () => !swipeDirection && handleSwipe('left'),
    onSwipedRight: () => !swipeDirection && handleSwipe('right'),
    trackMouse: true,
    preventDefaultTouchmoveEvent: true
  });

  const handleImageTap = () => {
    if (profile.photos && profile.photos.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % profile.photos.length);
    } else {
      setShowFullImage(true);
    }
  };

  const allPhotos = [profile.photo, ...(profile.photos || [])];

  return (
    <div className="relative w-full max-w-lg mx-auto h-[calc(100vh-16rem)] md:h-[600px]">
      <motion.div
        key={profile.id}
        {...handlers}
        style={{ 
          x,
          rotate,
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ 
          x: swipeDirection === 'left' ? -800 : swipeDirection === 'right' ? 800 : 0,
          opacity: 0,
          transition: { duration: 0.2 }
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="cursor-grab active:cursor-grabbing"
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative h-full bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Photo Gallery */}
          <motion.div 
            className="relative h-4/5"
            onTap={handleImageTap}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={allPhotos[currentImageIndex]}
                alt={profile.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>

            {/* Photo Navigation Dots */}
            {allPhotos.length > 1 && (
              <div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
                {allPhotos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex
                        ? 'bg-white'
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Swipe Direction Indicators */}
            <motion.div
              style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
              className="absolute top-8 left-8 bg-red-500 text-white px-6 py-2 rounded-full transform -rotate-12"
            >
              <span className="text-xl font-bold">NOPE</span>
            </motion.div>
            
            <motion.div
              style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
              className="absolute top-8 right-8 bg-green-500 text-white px-6 py-2 rounded-full transform rotate-12"
            >
              <span className="text-xl font-bold">LIKE</span>
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/0 to-black/60" />
          </motion.div>

          {/* Profile Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-6 text-white"
          >
            <div className="flex items-end justify-between mb-2">
              <h2 className="text-3xl font-bold">
                {profile.name}, {profile.age}
              </h2>
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {profile.distance} km
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <School className="w-4 h-4" />
              <p className="text-sm">{profile.university}</p>
            </div>

            <p className="text-sm opacity-90 line-clamp-2 mb-3">{profile.bio}</p>

            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
              {profile.interests.length > 3 && (
                <button
                  onClick={onShowDetails}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                >
                  +{profile.interests.length - 3}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="w-8 h-8" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onShowDetails}
          className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg text-purple-500 hover:bg-purple-50 transition-colors"
        >
          <Info className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (user) {
              handleSwipe('right');
            } else {
              toast.error('Connectez-vous pour liker des profils');
            }
          }}
          className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg text-green-500 hover:bg-green-50 transition-colors"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLiked ? 'liked' : 'unliked'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Heart className="w-8 h-8" fill={isLiked ? "currentColor" : "none"} />
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Media Viewer */}
      {showFullImage && (
        <MediaViewer
          media={allPhotos.map(url => ({ type: 'image', url }))}
          initialIndex={currentImageIndex}
          onClose={() => setShowFullImage(false)}
        />
      )}
    </div>
  );
};

export default SwipeableCard;