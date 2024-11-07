import React, { useState, useRef } from 'react';
import { Camera, Plus, X, Trash2 } from 'lucide-react';
import { Profile } from '../types';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const HOBBY_OPTIONS = [
  "Art", "Photography", "Travel", "Music", "Sports", "Reading", "Gaming",
  "Cooking", "Dancing", "Cinema", "Fashion", "Technology", "Languages",
  "Fitness", "Writing", "Volunteering", "Yoga", "Hiking", "Politics", "Environment"
];

interface ProfileEditorProps {
  onSave: (profile: Profile) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ onSave }) => {
  const { user, updateProfile, logout } = useAuthStore();
  const [editedProfile, setEditedProfile] = useState<Profile>(user!);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(user?.interests || []);
  const [newHobby, setNewHobby] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => ({
          ...prev,
          photos: [...prev.photos, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHobbyToggle = (hobby: string) => {
    setSelectedHobbies(prev =>
      prev.includes(hobby)
        ? prev.filter(h => h !== hobby)
        : [...prev, hobby]
    );
  };

  const handleAddCustomHobby = () => {
    if (newHobby.trim() && !selectedHobbies.includes(newHobby.trim())) {
      setSelectedHobbies(prev => [...prev, newHobby.trim()]);
      setNewHobby('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile = {
      ...editedProfile,
      interests: selectedHobbies
    };
    await updateProfile(updatedProfile);
    onSave(updatedProfile);
    toast.success('Profil mis à jour avec succès');
  };

  const handleDeleteProfile = async () => {
    try {
      await logout();
      toast.success('Profil supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du profil');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90%]">
        <h3 className="text-xl font-bold mb-4">Supprimer le profil</h3>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer votre profil ? Cette action est irréversible.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleDeleteProfile}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Modifier le profil</h2>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
          Supprimer le profil
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos
          </label>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {editedProfile.photos.map((photo, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                  onClick={() => {
                    const newPhotos = [...editedProfile.photos];
                    newPhotos.splice(index, 1);
                    setEditedProfile({ ...editedProfile, photos: newPhotos });
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={triggerFileInput}
              className="w-32 h-32 flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500"
            >
              <Plus className="w-8 h-8 text-gray-400" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        {/* Rest of the form remains the same */}
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={editedProfile.name}
              onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Âge
            </label>
            <input
              type="number"
              value={editedProfile.age}
              onChange={(e) => setEditedProfile({ ...editedProfile, age: Number(e.target.value) })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={editedProfile.bio}
            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            rows={4}
          />
        </div>

        {/* University Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Université
            </label>
            <input
              type="text"
              value={editedProfile.university}
              onChange={(e) => setEditedProfile({ ...editedProfile, university: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formation
            </label>
            <input
              type="text"
              value={editedProfile.course}
              onChange={(e) => setEditedProfile({ ...editedProfile, course: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Hobbies Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Centres d'intérêt
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {HOBBY_OPTIONS.map((hobby) => (
              <button
                key={hobby}
                type="button"
                onClick={() => handleHobbyToggle(hobby)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedHobbies.includes(hobby)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {hobby}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              placeholder="Ajouter un centre d'intérêt personnalisé"
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={handleAddCustomHobby}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Ajouter
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
        >
          Enregistrer les modifications
        </button>
      </form>

      {showDeleteConfirm && <DeleteConfirmationModal />}
    </div>
  );
};

export default ProfileEditor;