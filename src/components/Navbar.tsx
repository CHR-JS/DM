import React, { useState } from 'react';
import { MessageCircle, User, Bell, Menu, X, Compass, Users, MapPin } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { Notification } from '../types';
import { useAuthStore } from '../store/authStore';
import Logo from './Logo';

interface NavbarProps {
  notifications: Notification[];
  onMarkNotificationAsRead: (id: number) => void;
  onOpenChat: () => void;
  onOpenProfile: () => void;
  activeTab: 'discover' | 'social' | 'chat' | 'profile' | 'map';
  onChangeTab: (tab: 'discover' | 'social' | 'chat' | 'profile' | 'map') => void;
}

const Navbar: React.FC<NavbarProps> = ({
  notifications,
  onMarkNotificationAsRead,
  onOpenChat,
  onOpenProfile,
  activeTab,
  onChangeTab
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { logout } = useAuthStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="bg-white shadow-md relative">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onChangeTab('discover')}
              className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                activeTab === 'discover' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span>Découvrir</span>
            </button>

            <button
              onClick={() => onChangeTab('social')}
              className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                activeTab === 'social' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Social</span>
            </button>

            <button
              onClick={() => onChangeTab('map')}
              className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                activeTab === 'map' ? 'text-purple-600' : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <MapPin className="w-5 h-5" />
              <span>Carte</span>
            </button>

            <div className="h-6 w-px bg-gray-200" />

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationPanel
                    notifications={notifications}
                    onMarkAsRead={onMarkNotificationAsRead}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>
              <button
                onClick={onOpenChat}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <MessageCircle className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={onOpenProfile}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <User className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            {showMobileMenu ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg z-50">
            <div className="p-4 space-y-4">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  onOpenChat();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
              >
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <span>Messages</span>
              </button>
              <button
                onClick={() => {
                  onOpenProfile();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span>Profil</span>
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg text-red-500"
              >
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;