import { supabase } from '../lib/supabase';
import { Post, Profile } from '../types';

interface FeedParams {
  userId: number;
  page?: number;
  limit?: number;
}

export const feedService = {
  async getFeed({ userId, page = 1, limit = 10 }: FeedParams): Promise<Post[]> {
    // Récupérer les utilisateurs suivis
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    const followingIds = following?.map(f => f.following_id) || [];

    // Récupérer les posts avec un algorithme de pertinence
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_user_id_fkey(*),
        likes(count),
        comments(count)
      `)
      .or(`user_id.in.(${[userId, ...followingIds].join(',')}),likes.cs.{${userId}}`)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit);

    if (error) throw error;

    // Calculer le score de pertinence pour chaque post
    const scoredPosts = posts.map(post => {
      const age = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60); // en heures
      const likesWeight = 1;
      const commentsWeight = 1.5;
      const ageDecay = Math.exp(-age / 48); // décroissance exponentielle sur 48h
      const followingBonus = followingIds.includes(post.user_id) ? 1.2 : 1;
      
      // Score basé sur l'engagement et la fraîcheur
      const score = (
        (post.likes.count * likesWeight + 
        post.comments.count * commentsWeight) * 
        ageDecay * 
        followingBonus
      );

      return {
        ...post,
        score,
        timestamp: new Date(post.created_at)
      };
    });

    // Trier par score
    return scoredPosts.sort((a, b) => b.score - a.score);
  },

  async createPost(post: Omit<Post, 'id' | 'timestamp'>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: post.userId,
        content: post.content,
        images: post.images,
        video: post.video
      })
      .select()
      .single();

    if (error) throw error;

    // Notifier les followers
    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', post.userId);

    if (followers) {
      await Promise.all(
        followers.map(follower =>
          notificationService.createNotification({
            user_id: follower.follower_id,
            type: 'post',
            content: 'Nouvelle publication d\'un utilisateur que vous suivez',
            related_user_id: post.userId,
            related_post_id: data.id,
            read: false
          })
        )
      );
    }

    return {
      ...data,
      timestamp: new Date(data.created_at)
    };
  }
};