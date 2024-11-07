import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { MapPin, X, Heart } from 'lucide-react';
import { Profile } from '../types';
import { useAuthStore } from '../store/authStore';
import LikeButton from './common/LikeButton';

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
  onLike?: () => void;
  isLiked?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  onSwipe,
  onLike,
  isLiked = false
}) => {
  const { user } = useAuthStore();
  
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe('left'),
    onSwipedRight: () => onSwipe('right'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div
      {...handlers}
      className="bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all hover:scale-[1.01] max-w-lg mx-auto relative"
    >
      <div className="relative">
        <img
          src={profile.photo}
          alt={profile.name}
          className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">
            {profile.name}, {profile.age}
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">À {profile.distance} km</span>
          </div>
          <p className="text-sm opacity-90">{profile.university}</p>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <p className="text-gray-700 mb-4">{profile.bio}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.interests.map((interest, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium"
            >
              {interest}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-8">
          <button
            onClick={() => onSwipe('left')}
            className="p-4 bg-red-100 rounded-full text-red-500 hover:bg-red-200 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={() => {
              onLike?.();
              onSwipe('right');
            }}
            className="p-4 bg-green-100 rounded-full text-green-500 hover:bg-green-200 transition-colors"
          >
            <Heart className="w-8 h-8" fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;