import React, { useState } from 'react';
import { MapPin, Mail, Link as LinkIcon, Users, UserPlus, Settings, Grid, List, Camera, ImagePlus } from 'lucide-react';
import { Profile } from '../types';
import { useAuthStore } from '../store/authStore';
import SocialFeed from './SocialFeed';
import MediaViewer from './common/MediaViewer';

interface ProfilePageProps {
  profile: Profile;
  onEditProfile: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, onEditProfile }) => {
  const { user, followUser, unfollowUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [coverPhoto, setCoverPhoto] = useState(profile.coverPhoto || 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=1470&q=80');
  
  const isOwnProfile = user?.id === profile.id;
  const isFollowing = user?.following.includes(profile.id);

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
    setShowMediaViewer(true);
  };

  // Function to get profiles for followers/following
  const getProfilesForIds = (ids: number[]): Profile[] => {
    // In a real app, these would come from an API or store
    return ids.map(id => ({
      id,
      name: `Utilisateur ${id}`,
      age: 20,
      university: "Université",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      distance: 0,
      bio: "Bio de l'utilisateur",
      interests: [],
      photos: [],
      followers: [],
      following: []
    }));
  };

  const handleFollowToggle = async () => {
    if (!user) return;
    
    if (isFollowing) {
      await unfollowUser(profile.id);
    } else {
      await followUser(profile.id);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'cover') {
          setCoverPhoto(reader.result as string);
        } else {
          // Handle profile photo update through auth store
          useAuthStore.getState().updateProfile({
            ...profile,
            photo: reader.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderFollowModal = () => {
    const list = activeTab === 'followers' ? profile.followers : profile.following;
    const profiles = getProfilesForIds(list);
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-bold">
              {activeTab === 'followers' ? 'Abonnés' : 'Abonnements'}
            </h3>
            <button
              onClick={() => setShowFollowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="overflow-y-auto p-4 space-y-4">
            {profiles.map((followProfile) => (
              <div key={followProfile.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={followProfile.photo}
                    alt={followProfile.name}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer"
                    onClick={() => handleMediaClick(0)}
                  />
                  <div>
                    <h4 className="font-medium">{followProfile.name}</h4>
                    <p className="text-sm text-gray-500">{followProfile.university}</p>
                  </div>
                </div>
                {user && user.id !== followProfile.id && (
                  <button
                    onClick={() => user.following.includes(followProfile.id) 
                      ? unfollowUser(followProfile.id)
                      : followUser(followProfile.id)
                    }
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                      user.following.includes(followProfile.id)
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {user.following.includes(followProfile.id) ? 'Abonné' : 'Suivre'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const mediaItems = [
    { type: 'image' as const, url: profile.photo },
    ...profile.photos.map(photo => ({ type: 'image' as const, url: photo }))
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 rounded-t-xl overflow-hidden">
          <img
            src={coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => handleMediaClick(-1)}
          />
          {isOwnProfile && (
            <label className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/70 transition-colors">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'cover')}
              />
              <ImagePlus className="w-5 h-5 text-white" />
            </label>
          )}
        </div>

        {/* Profile Photo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <img
              src={profile.photo}
              alt={profile.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover shadow-lg bg-white cursor-pointer"
              onClick={() => handleMediaClick(0)}
            />
            {isOwnProfile && (
              <label className="absolute bottom-2 right-2 p-2 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(e, 'profile')}
                />
                <Camera className="w-4 h-4 text-white" />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-b-xl shadow-md">
        <div className="pt-24 px-4 md:px-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.university}
                </span>
                {profile.course && (
                  <span className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    {profile.course}
                  </span>
                )}
              </div>
            </div>
            {isOwnProfile ? (
              <button
                onClick={onEditProfile}
                className="w-full md:w-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Modifier le profil
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                className={`w-full md:w-auto px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Users className="w-4 h-4" />
                    Abonné
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Suivre
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-gray-700 mb-6">{profile.bio}</p>

          {/* Stats */}
          <div className="flex gap-6 mb-8">
            <button
              onClick={() => {
                setActiveTab('followers');
                setShowFollowModal(true);
              }}
              className="text-center hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
            >
              <div className="text-2xl font-bold">{profile.followers.length}</div>
              <div className="text-gray-600">Abonnés</div>
            </button>
            <button
              onClick={() => {
                setActiveTab('following');
                setShowFollowModal(true);
              }}
              className="text-center hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
            >
              <div className="text-2xl font-bold">{profile.following.length}</div>
              <div className="text-gray-600">Abonnements</div>
            </button>
          </div>

          {/* Interests */}
          <div>
            <h3 className="font-semibold mb-3">Centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="mt-8">
            <div className="grid grid-cols-3 gap-4">
              {profile.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleMediaClick(index + 1)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Follow Modal */}
      {showFollowModal && renderFollowModal()}

      {/* Media Viewer */}
      {showMediaViewer && (
        <MediaViewer
          media={mediaItems}
          initialIndex={selectedMediaIndex}
          onClose={() => setShowMediaViewer(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;