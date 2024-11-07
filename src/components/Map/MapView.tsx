import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Profile } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { UserPlus, MessageCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  matches: Profile[];
  onOpenChat: (profile: Profile) => void;
}

const MapView: React.FC<MapViewProps> = ({ matches, onOpenChat }) => {
  const { user, followUser, unfollowUser } = useAuthStore();

  // Custom marker icon
  const customIcon = new L.Icon({
    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
  });

  const handleFollowToggle = async (profile: Profile) => {
    if (user?.following.includes(profile.id)) {
      await unfollowUser(profile.id);
    } else {
      await followUser(profile.id);
    }
  };

  // Paris center coordinates
  const center: [number, number] = [48.8566, 2.3522];

  return (
    <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          maxClusterRadius={50}
          iconCreateFunction={(cluster) => {
            return L.divIcon({
              html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
              className: 'custom-cluster-icon',
              iconSize: L.point(40, 40),
            });
          }}
        >
          {matches.map((profile) => (
            <Marker
              key={profile.id}
              position={[
                center[0] + (Math.random() - 0.5) * 0.1,
                center[1] + (Math.random() - 0.5) * 0.1
              ]}
              icon={customIcon}
            >
              <Popup className="custom-popup">
                <div className="w-64">
                  <div className="relative">
                    <img
                      src={profile.photo}
                      alt={profile.name}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="text-white font-bold">{profile.name}, {profile.age}</h3>
                      <p className="text-white text-sm">{profile.university}</p>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <p className="text-sm text-gray-600 mb-2">{profile.bio}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {profile.interests.slice(0, 3).map((interest, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFollowToggle(profile)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                          user?.following.includes(profile.id)
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        {user?.following.includes(profile.id) ? 'Abonné' : 'Suivre'}
                      </button>
                      
                      <button
                        onClick={() => onOpenChat(profile)}
                        className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;