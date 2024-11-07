import { Profile } from '../types';

const MOCK_USERS = {
  'demo@example.com': {
    password: 'password123',
    profile: {
      id: 1,
      name: "Sophie Martin",
      age: 20,
      university: "Sorbonne Université",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
      distance: 0.5,
      bio: "🎨 Art History student | Coffee addict | Museum enthusiast",
      interests: ["Art", "Photography", "Travel"],
      photos: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
      ],
      course: "Histoire de l'Art",
      yearOfStudy: 2,
      followers: [2],
      following: [2]
    }
  }
};

export const mockAuth = {
  signIn: async (email: string, password: string): Promise<Profile> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    const user = MOCK_USERS[email as keyof typeof MOCK_USERS];
    
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    return user.profile;
  },

  signInWithProvider: async (provider: string): Promise<Profile> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return MOCK_USERS['demo@example.com'].profile;
  },

  signOut: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  }
};