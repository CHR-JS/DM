import React, { useRef, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onClose
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'match':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed top-16 right-4 mt-2 w-80 bg-white rounded-xl shadow-xl border overflow-hidden z-[9999]"
      ref={panelRef}
      style={{
        maxHeight: 'calc(100vh - 5rem)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="p-4 border-b bg-white sticky top-0 z-[9999] flex items-center justify-between">
        <h3 className="font-bold">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Aucune nouvelle notification
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <motion.button
                key={notification.id}
                layout
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                whileHover={{ scale: 0.98 }}
                onClick={() => onMarkAsRead(notification.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 ${
                  !notification.read ? 'bg-purple-50' : ''
                }`}
              >
                <motion.div 
                  className="mt-1"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {getIcon(notification.type)}
                </motion.div>
                <div className="flex-1 text-left">
                  <p className="text-sm">{notification.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-purple-500 rounded-full mt-2"
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationPanel;