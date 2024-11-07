import { Profile } from '../types';
import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export const matchService = {
  async likeProfile(likerId: number, likedId: number): Promise<boolean> {
    try {
      // Enregistrer le like
      const { error: likeError } = await supabase
        .from('likes')
        .insert({ liker_id: likerId, liked_id: likedId });

      if (likeError) throw likeError;

      // Vérifier si c'est un match (like mutuel)
      const { data: mutualLike } = await supabase
        .from('likes')
        .select()
        .eq('liker_id', likedId)
        .eq('liked_id', likerId)
        .single();

      if (mutualLike) {
        // Créer le match
        const { error: matchError } = await supabase
          .from('matches')
          .insert({ user1_id: likerId, user2_id: likedId });

        if (matchError) throw matchError;

        // Créer les notifications pour les deux utilisateurs
        await Promise.all([
          notificationService.createNotification({
            user_id: likerId,
            type: 'match',
            content: 'Nouveau match !',
            related_user_id: likedId,
            read: false
          }),
          notificationService.createNotification({
            user_id: likedId,
            type: 'match',
            content: 'Nouveau match !',
            related_user_id: likerId,
            read: false
          })
        ]);

        return true; // C'est un match
      }

      // Créer une notification de like pour l'utilisateur liké
      await notificationService.createNotification({
        user_id: likedId,
        type: 'like',
        content: 'Quelqu\'un vous a liké !',
        related_user_id: likerId,
        read: false
      });

      return false; // Pas de match
    } catch (error) {
      console.error('Error in likeProfile:', error);
      throw error;
    }
  },

  async getMatches(userId: number): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        user1_id,
        user2_id,
        profiles1:profiles!matches_user1_id_fkey(*),
        profiles2:profiles!matches_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) throw error;

    return data.map(match => {
      const otherProfile = match.user1_id === userId ? match.profiles2 : match.profiles1;
      return otherProfile;
    });
  },

  async getLikedProfiles(userId: number): Promise<number[]> {
    const { data, error } = await supabase
      .from('likes')
      .select('liked_id')
      .eq('liker_id', userId);

    if (error) throw error;
    return data.map(like => like.liked_id);
  }
};