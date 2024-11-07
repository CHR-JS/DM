import React, { useState } from 'react';
import { Bell, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../types';
import NotificationPanel from './NotificationPanel';

interface MobileAppBarProps {
  notifications: Notification[];
  onMarkNotificationAsRead: (id: number) => void;
  onOpenSettings: () => void;
}

const MobileAppBar: React.FC<MobileAppBarProps> = ({
  notifications,
  onMarkNotificationAsRead,
  onOpenSettings
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50 safe-area-inset-top"
    >
      <div className="h-14 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          CampusConnect
        </h1>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center px-1"
                >
                  <span className="text-white text-xs font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full right-0 mt-2 w-screen sm:w-80 mx-4"
            >
              <NotificationPanel
                notifications={notifications}
                onMarkAsRead={(id) => {
                  onMarkNotificationAsRead(id);
                  if (notifications.filter(n => !n.read).length === 1) {
                    setShowNotifications(false);
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MobileAppBar;