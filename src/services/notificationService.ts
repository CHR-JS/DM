import { supabase } from '../lib/supabase';
import { Notification, NotificationType } from '../types';

interface CreateNotificationParams {
  user_id: number;
  type: NotificationType;
  content: string;
  related_user_id?: number;
  related_post_id?: number;
  read: boolean;
}

export const notificationService = {
  async getNotifications(userId: number): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        related_user:profiles!notifications_related_user_id_fkey(*),
        related_post:posts!notifications_related_post_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(notification => ({
      ...notification,
      timestamp: new Date(notification.created_at)
    }));
  },

  async createNotification(params: CreateNotificationParams) {
    const { error } = await supabase
      .from('notifications')
      .insert(params);

    if (error) throw error;
  },

  async markAsRead(notificationId: number) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(userId: number) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);

    if (error) throw error;
  }
};