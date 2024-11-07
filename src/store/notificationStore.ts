import { create } from 'zustand';
import { Notification } from '../types';
import { mockNotifications } from '../lib/mockData';
import { logError } from '../utils/errorHandling';

interface NotificationState {
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  fetchNotifications: async () => {
    try {
      // Using mock data for now since Supabase is not configured
      const notifications = mockNotifications;
      set({ notifications });
    } catch (error) {
      throw logError(error, 'NotificationStore:fetchNotifications');
    }
  },

  markAsRead: async (id: number) => {
    try {
      set(state => ({
        notifications: state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      }));
    } catch (error) {
      throw logError(error, 'NotificationStore:markAsRead');
    }
  },

  addNotification: async (notification) => {
    try {
      const newNotification: Notification = {
        id: Date.now(),
        timestamp: new Date(),
        read: false,
        ...notification
      };

      set(state => ({
        notifications: [newNotification, ...state.notifications]
      }));
    } catch (error) {
      throw logError(error, 'NotificationStore:addNotification');
    }
  }
}));