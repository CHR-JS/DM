import { supabase } from '../lib/supabase';
import { Profile, Post, Comment, Message, Notification } from '../types';
import { Database } from '../types/database';

type Tables = Database['public']['Tables'];

export const profileService = {
  async getProfile(id: number): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, followers:follows!follower_id(*), following:follows!following_id(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      ...data,
      followers: data.followers.map(f => f.follower_id),
      following: data.following.map(f => f.following_id)
    };
  },

  async updateProfile(profile: Partial<Tables['profiles']['Update']>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', profile.id!)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async followUser(followerId: number, followingId: number) {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) throw error;
  },

  async unfollowUser(followerId: number, followingId: number) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  }
};

export const postService = {
  async getPosts(): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        comments:comments(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(post => ({
      ...post,
      timestamp: new Date(post.created_at)
    }));
  },

  async createPost(post: Omit<Tables['posts']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async likePost(postId: number, userId: number) {
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;

    const likes = post.likes || [];
    const newLikes = likes.includes(userId)
      ? likes.filter(id => id !== userId)
      : [...likes, userId];

    const { error: updateError } = await supabase
      .from('posts')
      .update({ likes: newLikes })
      .eq('id', postId);

    if (updateError) throw updateError;
  }
};

export const commentService = {
  async createComment(comment: Tables['comments']['Insert']) {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async likeComment(commentId: number, userId: number) {
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('likes')
      .eq('id', commentId)
      .single();

    if (fetchError) throw fetchError;

    const likes = comment.likes || [];
    const newLikes = likes.includes(userId)
      ? likes.filter(id => id !== userId)
      : [...likes, userId];

    const { error: updateError } = await supabase
      .from('comments')
      .update({ likes: newLikes })
      .eq('id', commentId);

    if (updateError) throw updateError;
  }
};

export const messageService = {
  async getMessages(userId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(message => ({
      ...message,
      timestamp: new Date(message.created_at)
    }));
  },

  async sendMessage(message: Tables['messages']['Insert']) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(messageId: number) {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) throw error;
  }
};

export const notificationService = {
  async getNotifications(userId: number): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(notification => ({
      ...notification,
      timestamp: new Date(notification.created_at)
    }));
  },

  async createNotification(notification: Tables['notifications']['Insert']) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: number) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }
};