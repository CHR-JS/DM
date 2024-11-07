import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { Post } from '../../types';
import toast from 'react-hot-toast';

export const createPost = async (userId: string, content: string, images: File[]) => {
  try {
    // Upload images first
    const imageUrls = await Promise.all(
      images.map(async (image) => {
        const storageRef = ref(storage, `posts/${userId}/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);
        return getDownloadURL(snapshot.ref);
      })
    );

    // Get user profile
    const userDoc = await getDoc(doc(db, 'profiles', userId));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const post = {
      userId,
      author: {
        id: userId,
        name: userDoc.data().name,
        photo: userDoc.data().photo
      },
      content,
      images: imageUrls,
      likes: [],
      comments: [],
      shares: 0,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'posts'), post);
    
    return {
      id: docRef.id,
      ...post,
      timestamp: post.createdAt.toDate()
    };
  } catch (error) {
    console.error('Error creating post:', error);
    toast.error('Erreur lors de la création du post');
    throw error;
  }
};

export const getPosts = async (filter: 'trending' | 'recent' | 'following' = 'recent', userId?: string) => {
  try {
    let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    if (filter === 'following' && userId) {
      const userDoc = await getDoc(doc(db, 'profiles', userId));
      const following = userDoc.data()?.following || [];
      q = query(
        collection(db, 'posts'),
        where('userId', 'in', [userId, ...following]),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        timestamp: data.createdAt.toDate()
      } as Post);
    });

    if (filter === 'trending') {
      // Sort by engagement (likes + comments)
      posts.sort((a, b) => 
        (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length)
      );
    }

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    toast.error('Erreur lors de la récupération des posts');
    return [];
  }
};

export const likePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const likes = postDoc.data().likes || [];
    const newLikes = likes.includes(userId)
      ? likes.filter((id: string) => id !== userId)
      : [...likes, userId];

    await updateDoc(postRef, { likes: newLikes });
  } catch (error) {
    console.error('Error liking post:', error);
    toast.error('Erreur lors du like');
    throw error;
  }
};

export const addComment = async (postId: string, userId: string, content: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const userDoc = await getDoc(doc(db, 'profiles', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const comment = {
      id: Date.now(),
      userId,
      content,
      timestamp: new Date(),
      likes: []
    };

    await updateDoc(postRef, {
      comments: [...(await getDoc(postRef)).data()?.comments || [], comment]
    });

    return comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    toast.error('Erreur lors de l\'ajout du commentaire');
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
    toast.success('Publication supprimée');
  } catch (error) {
    console.error('Error deleting post:', error);
    toast.error('Erreur lors de la suppression');
    throw error;
  }
};