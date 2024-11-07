import { Profile } from '../types';

// Universités parisiennes
const UNIVERSITIES = [
  "Sciences Po Paris",
  "Sorbonne Université",
  "Université Paris-Dauphine",
  "Université Paris-Saclay",
  "École Polytechnique",
  "HEC Paris",
  "ESSEC Business School",
  "Université Paris 1 Panthéon-Sorbonne",
  "Université Paris Cité",
  "CentraleSupélec"
];

// Formations
const COURSES = [
  "Relations Internationales",
  "Droit",
  "Économie",
  "Management",
  "Mathématiques",
  "Informatique",
  "Physique",
  "Philosophie",
  "Histoire de l'Art",
  "Sciences Politiques",
  "Marketing",
  "Finance",
  "Médecine",
  "Architecture",
  "Design"
];

// Centres d'intérêt
const INTERESTS = [
  "Art", "Musique", "Cinéma", "Lecture", "Voyages",
  "Sport", "Photographie", "Théâtre", "Danse", "Mode",
  "Gastronomie", "Vin", "Tech", "Startups", "Écologie",
  "Politique", "Bénévolat", "Yoga", "Méditation", "Gaming",
  "Concerts", "Festivals", "Museums", "Expositions", "Randonnée",
  "Vélo", "Surf", "Ski", "Tennis", "Football"
];

// Photos de profil (Unsplash)
const PROFILE_PHOTOS = {
  male: [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
  ],
  female: [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
  ]
};

// Prénoms
const NAMES = {
  male: [
    "Thomas", "Lucas", "Hugo", "Nathan", "Louis",
    "Gabriel", "Léo", "Jules", "Arthur", "Adam",
    "Maxime", "Antoine", "Paul", "Alexandre", "Victor"
  ],
  female: [
    "Emma", "Louise", "Alice", "Chloé", "Inès",
    "Sarah", "Léa", "Julia", "Camille", "Zoé",
    "Manon", "Clara", "Juliette", "Charlotte", "Sofia"
  ]
};

// Noms de famille
const LAST_NAMES = [
  "Martin", "Bernard", "Dubois", "Thomas", "Robert",
  "Richard", "Petit", "Durand", "Leroy", "Moreau",
  "Simon", "Laurent", "Lefebvre", "Michel", "Garcia"
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomLocation(centerLat: number, centerLng: number, radiusInKm: number): { lat: number; lng: number; distance: number } {
  // Convert radius from kilometers to degrees
  const radiusInDegrees = radiusInKm / 111.32;

  // Generate random distance within radius
  const distance = Math.random() * radiusInKm;
  
  // Generate random angle
  const angle = Math.random() * Math.PI * 2;
  
  // Calculate offset
  const lat = centerLat + (Math.sin(angle) * distance / 111.32);
  const lng = centerLng + (Math.cos(angle) * distance / (111.32 * Math.cos(centerLat * (Math.PI / 180))));
  
  return { lat, lng, distance: Math.round(distance * 10) / 10 };
}

export function generateMockProfiles(count: number): Profile[] {
  const profiles: Profile[] = [];
  const PARIS_CENTER = { lat: 48.8566, lng: 2.3522 };

  for (let i = 0; i < count; i++) {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const firstName = getRandomElement(NAMES[gender]);
    const lastName = getRandomElement(LAST_NAMES);
    const mainPhoto = getRandomElement(PROFILE_PHOTOS[gender]);
    const otherPhotos = getRandomElements(PROFILE_PHOTOS[gender], getRandomInt(2, 4));
    
    // Generate location: 10 profiles within 5km, rest within 50km
    const location = generateRandomLocation(
      PARIS_CENTER.lat,
      PARIS_CENTER.lng,
      i < 10 ? 5 : 50
    );

    const profile: Profile = {
      id: i + 1,
      name: `${firstName} ${lastName}`,
      age: getRandomInt(18, 25),
      university: getRandomElement(UNIVERSITIES),
      photo: mainPhoto,
      distance: location.distance,
      bio: `Étudiant${gender === 'female' ? 'e' : ''} en ${getRandomElement(COURSES)} 📚\n${getRandomElement([
        "Passionné(e) par l'art et la culture",
        "Amateur(trice) de voyages et de découvertes",
        "À la recherche de nouvelles rencontres enrichissantes",
        "Toujours partant(e) pour de nouvelles aventures",
        "Fan de sport et de sorties culturelles"
      ])}`,
      interests: getRandomElements(INTERESTS, getRandomInt(4, 6)),
      photos: otherPhotos,
      course: getRandomElement(COURSES),
      yearOfStudy: getRandomInt(1, 5),
      followers: [],
      following: []
    };

    profiles.push(profile);
  }

  // Add some random followers/following connections
  profiles.forEach(profile => {
    const otherProfiles = profiles.filter(p => p.id !== profile.id);
    const followersCount = getRandomInt(0, 5);
    const followingCount = getRandomInt(0, 5);
    
    profile.followers = getRandomElements(otherProfiles, followersCount).map(p => p.id);
    profile.following = getRandomElements(otherProfiles, followingCount).map(p => p.id);
  });

  return profiles;
}

export const MOCK_PROFILES = generateMockProfiles(30);