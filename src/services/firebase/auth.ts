import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Profile } from '../../types';
import toast from 'react-hot-toast';

export interface AuthError {
  code: string;
  message: string;
}

export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(result.user.uid);
    return profile;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getErrorMessage(authError.code));
  }
};

export const signUp = async (email: string, password: string, profile: Omit<Profile, 'id'>) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    await updateProfile(result.user, {
      displayName: profile.name,
      photoURL: profile.photo
    });

    // Create profile document
    await setDoc(doc(db, 'profiles', result.user.uid), {
      ...profile,
      id: result.user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return {
      ...profile,
      id: result.user.uid
    };
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getErrorMessage(authError.code));
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if profile exists
    const profile = await getUserProfile(result.user.uid);
    
    if (!profile) {
      // Create new profile if it doesn't exist
      const newProfile: Profile = {
        id: result.user.uid,
        name: result.user.displayName || 'Utilisateur',
        photo: result.user.photoURL || 'https://via.placeholder.com/150',
        age: 20,
        university: '',
        distance: 0,
        bio: '',
        interests: [],
        photos: [],
        followers: [],
        following: []
      };

      await setDoc(doc(db, 'profiles', result.user.uid), {
        ...newProfile,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return newProfile;
    }

    return profile;
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getErrorMessage(authError.code));
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(getErrorMessage(authError.code));
  }
};

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as Profile;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    toast.error('Erreur lors de la récupération du profil');
    return null;
  }
};

const getErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Adresse email invalide';
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé';
    case 'auth/user-not-found':
      return 'Aucun compte associé à cette adresse email';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect';
    case 'auth/email-already-in-use':
      return 'Cette adresse email est déjà utilisée';
    case 'auth/operation-not-allowed':
      return 'Opération non autorisée';
    case 'auth/weak-password':
      return 'Le mot de passe doit contenir au moins 6 caractères';
    default:
      return 'Une erreur est survenue';
  }
};