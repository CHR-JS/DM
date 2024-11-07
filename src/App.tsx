import React, { useState, useEffect } from 'react';
import { useMediaQuery } from './hooks/useMediaQuery';
import { usePermissions } from './hooks/usePermissions';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';
import { useMatchStore } from './store/matchStore';
import LoginForm from './components/Auth/LoginForm';
import Navbar from './components/Navbar';
import MobileAppBar from './components/Navigation/MobileAppBar';
import BottomNav from './components/Navigation/BottomNav';
import SwipeableCard from './components/Discovery/SwipeableCard';
import ProfileDetails from './components/Discovery/ProfileDetails';
import SocialFeed from './components/Social/SocialFeed';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import ProfilePage from './components/ProfilePage';
import ProfileEditor from './components/ProfileEditor';
import PermissionsModal from './components/PermissionsModal';
import MapView from './components/Map/MapView';

const App: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user, isAuthenticated } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead } = useNotificationStore();
  const { discoveryProfiles, loadDiscoveryProfiles, removeFromDiscovery } = useMatchStore();
  const [activeTab, setActiveTab] = useState<'discover' | 'social' | 'chat' | 'profile' | 'map'>('discover');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Profile | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const { permissions, requestAllPermissions } = usePermissions();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications().catch(console.error);
      loadDiscoveryProfiles().catch(console.error);
    }
  }, [isAuthenticated, fetchNotifications, loadDiscoveryProfiles]);

  useEffect(() => {
    if (permissions.state === 'prompt') {
      setShowPermissions(true);
    }
  }, [permissions.state]);

  const handlePermissions = async () => {
    await requestAllPermissions();
    setShowPermissions(false);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (discoveryProfiles.length > 0) {
      removeFromDiscovery(discoveryProfiles[0].id);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return (
          <div className="container mx-auto px-4 py-6">
            {discoveryProfiles.length > 0 ? (
              <SwipeableCard
                profile={discoveryProfiles[0]}
                onSwipe={handleSwipe}
                onShowDetails={() => setShowProfileDetails(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Plus personne à proximité</h2>
                <p className="text-gray-500">Revenez plus tard pour découvrir de nouveaux profils</p>
              </div>
            )}
            {showProfileDetails && discoveryProfiles.length > 0 && (
              <ProfileDetails
                profile={discoveryProfiles[0]}
                onClose={() => setShowProfileDetails(false)}
              />
            )}
          </div>
        );
      
      case 'social':
        return (
          <div className="container mx-auto px-4 py-6">
            <SocialFeed />
          </div>
        );
      
      case 'chat':
        return (
          <div className="container mx-auto h-[calc(100vh-5rem)] px-4 py-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
              <div className="flex h-full">
                <div className={`${isMobile && selectedChat ? 'hidden' : 'w-80 lg:w-96'} border-r`}>
                  <ChatList
                    matches={discoveryProfiles.slice(0, 5)}
                    lastMessages={{}}
                    onSelectChat={setSelectedChat}
                    selectedProfileId={selectedChat?.id}
                  />
                </div>
                <div className={`flex-1 ${isMobile && !selectedChat ? 'hidden' : ''}`}>
                  {selectedChat ? (
                    <ChatWindow
                      profile={selectedChat}
                      messages={[]}
                      onSendMessage={(content) => {
                        console.log('Sending message:', content);
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Sélectionnez une conversation
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'map':
        return (
          <div className="container mx-auto px-4 py-6">
            <MapView
              matches={discoveryProfiles.filter(p => user?.following.includes(p.id))}
              onOpenChat={(profile) => {
                setSelectedChat(profile);
                setActiveTab('chat');
              }}
            />
          </div>
        );
      
      case 'profile':
        return (
          <div className="container mx-auto px-4 py-6">
            {isEditingProfile ? (
              <ProfileEditor
                onSave={(profile) => {
                  console.log('Saving profile:', profile);
                  setIsEditingProfile(false);
                }}
              />
            ) : (
              <ProfilePage
                profile={user!}
                onEditProfile={() => setIsEditingProfile(true)}
              />
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile ? (
        <MobileAppBar
          notifications={notifications}
          onMarkNotificationAsRead={markAsRead}
          onOpenSettings={() => {
            setIsEditingProfile(true);
            setActiveTab('profile');
          }}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onRefresh={() => {}}
          isRefreshing={false}
        />
      ) : (
        <Navbar
          notifications={notifications}
          onMarkNotificationAsRead={markAsRead}
          onOpenChat={() => setActiveTab('chat')}
          onOpenProfile={() => {
            setIsEditingProfile(false);
            setActiveTab('profile');
          }}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      )}
      
      <div className={`${isMobile ? 'pt-14 pb-20' : 'pt-16'}`}>
        {renderContent()}
      </div>

      {isMobile && (
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          notifications={notifications}
        />
      )}

      {showPermissions && (
        <PermissionsModal
          onRequestPermissions={handlePermissions}
          onSkip={() => setShowPermissions(false)}
        />
      )}
    </div>
  );
};

export default App;