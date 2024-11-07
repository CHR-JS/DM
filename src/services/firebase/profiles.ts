import { 
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  GeoPoint,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Profile } from '../../types';
import toast from 'react-hot-toast';

export const getProfiles = async (userId: string, maxDistance: number = 50) => {
  try {
    const profilesRef = collection(db, 'profiles');
    const userDoc = await getDoc(doc(db, 'profiles', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const userLocation = userDoc.data().location as GeoPoint;
    
    // Get all profiles within maxDistance km
    // Note: This is a simplified version. In production, you should use geohashing
    const querySnapshot = await getDocs(profilesRef);
    
    const profiles: Profile[] = [];
    querySnapshot.forEach(doc => {
      if (doc.id !== userId) {
        const data = doc.data();
        const location = data.location as GeoPoint;
        
        // Calculate distance (simplified)
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          location.latitude,
          location.longitude
        );

        if (distance <= maxDistance) {
          profiles.push({
            ...data,
            id: doc.id,
            distance: Math.round(distance * 10) / 10
          } as Profile);
        }
      }
    });

    return profiles;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    toast.error('Erreur lors de la récupération des profils');
    return [];
  }
};

export const updateProfile = async (userId: string, data: Partial<Profile>) => {
  try {
    const profileRef = doc(db, 'profiles', userId);
    await updateDoc(profileRef, {
      ...data,
      updatedAt: new Date()
    });
    toast.success('Profil mis à jour');
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Erreur lors de la mise à jour du profil');
    throw error;
  }
};

export const followUser = async (followerId: string, followingId: string) => {
  try {
    const followerRef = doc(db, 'profiles', followerId);
    const followingRef = doc(db, 'profiles', followingId);

    await updateDoc(followerRef, {
      following: [...(await getDoc(followerRef)).data()?.following || [], followingId]
    });

    await updateDoc(followingRef, {
      followers: [...(await getDoc(followingRef)).data()?.followers || [], followerId]
    });

    toast.success('Abonnement réussi');
  } catch (error) {
    console.error('Error following user:', error);
    toast.error('Erreur lors de l\'abonnement');
    throw error;
  }
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  try {
    const followerRef = doc(db, 'profiles', followerId);
    const followingRef = doc(db, 'profiles', followingId);

    const followerDoc = await getDoc(followerRef);
    const followingDoc = await getDoc(followingRef);

    await updateDoc(followerRef, {
      following: followerDoc.data()?.following.filter((id: string) => id !== followingId)
    });

    await updateDoc(followingRef, {
      followers: followingDoc.data()?.followers.filter((id: string) => id !== followerId)
    });

    toast.success('Désabonnement réussi');
  } catch (error) {
    console.error('Error unfollowing user:', error);
    toast.error('Erreur lors du désabonnement');
    throw error;
  }
};

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}