import React from 'react';
import { Camera, MapPin, Image } from 'lucide-react';

interface PermissionsModalProps {
  onRequestPermissions: () => Promise<void>;
  onSkip: () => void;
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  onRequestPermissions,
  onSkip
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Autorisations requises</h2>
        
        <p className="text-gray-600 mb-6">
          Pour une meilleure expérience, DM a besoin des autorisations suivantes :
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">Caméra</h3>
              <p className="text-sm text-gray-500">Pour prendre des photos de profil</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Image className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">Photos</h3>
              <p className="text-sm text-gray-500">Pour partager des photos depuis votre galerie</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">Localisation</h3>
              <p className="text-sm text-gray-500">Pour trouver des étudiants près de vous</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Plus tard
          </button>
          <button
            onClick={onRequestPermissions}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Autoriser
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsModal;