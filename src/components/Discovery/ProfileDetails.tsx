import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, School, Briefcase, Heart, MessageCircle, UserPlus, Link2 } from 'lucide-react';
import { Profile } from '../../types';
import { useAuthStore } from '../../store/authStore';
import MediaViewer from '../common/MediaViewer';
import toast from 'react-hot-toast';

interface ProfileDetailsProps {
  profile: Profile;
  onClose: () => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ profile, onClose }) => {
  const { user, followUser, unfollowUser } = useAuthStore();
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url: string }[] | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isFollowing = user?.following.includes(profile.id);

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Connectez-vous pour suivre des profils');
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser(profile.id);
        toast.success('Vous ne suivez plus ce profil');
      } else {
        await followUser(profile.id);
        toast.success('Vous suivez maintenant ce profil');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Une erreur est survenue');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Profil de ${profile.name}`,
          text: `Découvrez le profil de ${profile.name} sur DM`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié !');
      }
      setShowShareMenu(false);
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Erreur lors du partage');
    }
  };

  const allPhotos = [profile.photo, ...(profile.photos || [])];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-64">
          <img
            src={profile.photo}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold mb-1">
              {profile.name}, {profile.age}
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              <span>À {profile.distance} km</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
          {/* Info Section */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <School className="w-5 h-5" />
              <span>{profile.university}</span>
            </div>
            {profile.course && (
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-5 h-5" />
                <span>{profile.course} - {profile.yearOfStudy}e année</span>
              </div>
            )}
          </div>

          <p className="text-gray-700 mb-6">{profile.bio}</p>

          {/* Interests */}
          <div className="mb-8">
            <h3 className="font-semibold mb-3">Centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Photos Grid */}
          <div>
            <h3 className="font-semibold mb-3">Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {allPhotos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedMediaIndex(index);
                    setSelectedMedia(allPhotos.map(url => ({ type: 'image', url })));
                  }}
                  className="relative aspect-square group overflow-hidden rounded-lg"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <button
              onClick={handleFollowToggle}
              className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              {isFollowing ? 'Abonné' : 'Suivre'}
            </button>

            <button
              onClick={() => setShowShareMenu(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <Link2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Share Menu */}
      <AnimatePresence>
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowShareMenu(false)}
          >
            <div
              className="bg-white rounded-xl p-6 w-full max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Partager le profil</h3>
              <div className="space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Link2 className="w-5 h-5 text-gray-500" />
                  <span>Copier le lien</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Viewer */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          initialIndex={selectedMediaIndex}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </motion.div>
  );
};

export default ProfileDetails;