import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Users, MessageCircle, MapPin, User } from 'lucide-react';
import { Notification } from '../../types';

interface BottomNavProps {
  activeTab: 'discover' | 'social' | 'chat' | 'profile' | 'map';
  onChangeTab: (tab: 'discover' | 'social' | 'chat' | 'profile' | 'map') => void;
  notifications: Notification[];
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, notifications }) => {
  // Count unread notifications by type
  const unreadMessages = notifications.filter(n => n.type === 'message' && !n.read).length;
  const unreadSocial = notifications.filter(n => 
    (n.type === 'like' || n.type === 'comment') && !n.read
  ).length;
  const unreadMatches = notifications.filter(n => 
    n.type === 'match' && !n.read
  ).length;
  const unreadMapEvents = notifications.filter(n => 
    n.type === 'nearby' && !n.read
  ).length;

  const tabs = [
    { id: 'discover' as const, icon: Compass, label: 'Découvrir', badge: unreadMatches },
    { id: 'social' as const, icon: Users, label: 'Social', badge: unreadSocial },
    { id: 'chat' as const, icon: MessageCircle, label: 'Messages', badge: unreadMessages },
    { id: 'map' as const, icon: MapPin, label: 'Carte', badge: unreadMapEvents },
    { id: 'profile' as const, icon: User, label: 'Profil' }
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg safe-area-inset-bottom z-50"
    >
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ id, icon: Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => onChangeTab(id)}
            className="relative flex-1 h-full flex flex-col items-center justify-center"
          >
            <motion.div
              initial={false}
              animate={{
                scale: activeTab === id ? 1.2 : 1,
                color: activeTab === id ? '#7C3AED' : '#6B7280'
              }}
              className="relative"
            >
              <Icon className="w-6 h-6" />
              {badge && badge > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center px-1"
                >
                  <span className="text-white text-xs font-medium">
                    {badge > 99 ? '99+' : badge}
                  </span>
                </motion.div>
              )}
            </motion.div>
            <motion.span
              initial={false}
              animate={{
                scale: activeTab === id ? 1 : 0.9,
                color: activeTab === id ? '#7C3AED' : '#6B7280'
              }}
              className="text-xs mt-1"
            >
              {label}
            </motion.span>
            {activeTab === id && (
              <motion.div
                layoutId="bottomNav-indicator"
                className="absolute bottom-0 w-12 h-0.5 bg-purple-600 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </motion.nav>
  );
};

export default BottomNav;