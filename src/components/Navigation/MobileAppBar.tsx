import React, { useState } from 'react';
import { Bell, Settings, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../../types';
import NotificationPanel from '../NotificationPanel';
import Logo from '../Logo';

interface MobileAppBarProps {
  notifications: Notification[];
  onMarkNotificationAsRead: (id: number) => void;
  onOpenSettings: () => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const MobileAppBar: React.FC<MobileAppBarProps> = ({
  notifications,
  onMarkNotificationAsRead,
  onOpenSettings,
  onRefresh,
  isRefreshing
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
        <Logo size="sm" />
        
        <div className="flex items-center gap-4">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
            >
              <RefreshCw className="w-6 h-6 text-gray-600" />
            </motion.div>
          </button>

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
            <NotificationPanel
              notifications={notifications}
              onMarkAsRead={onMarkNotificationAsRead}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MobileAppBar;