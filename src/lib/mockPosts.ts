import { Post } from '../types';
import { MOCK_PROFILES } from './mockProfiles';

// Contenu de posts variés
const POST_CONTENTS = [
  "Super soirée d'intégration hier ! 🎉",
  "Qui est partant pour réviser ensemble à la BU ? 📚",
  "Je cherche des gens pour un projet associatif, DM si intéressé ! 🤝",
  "Premier jour de stage terminé ! 💼",
  "Quelqu'un pour le concert de ce soir ? 🎵",
  "Les partiels approchent... Courage à tous ! 💪",
  "Belle expo au Centre Pompidou aujourd'hui 🎨",
  "Recherche coloc pour l'année prochaine ! 🏠",
  "Nouveau resto cool près de la fac, à tester ! 🍽️",
  "Session sport au Luxembourg, qui me rejoint ? 🏃‍♂️"
];

// Images de posts (Unsplash)
const POST_IMAGES = [
  ["https://images.unsplash.com/photo-1496024840928-4c417adf211d?auto=format&fit=crop&w=800&q=80"],
  ["https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80"],
  ["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"],
  ["https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"],
  [
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80"
  ],
  ["https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80"],
  ["https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"],
  [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80"
  ]
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

export function generateMockPosts(count: number): Post[] {
  const posts: Post[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const author = getRandomElement(MOCK_PROFILES);
    const likesCount = getRandomInt(0, 50);
    const likers = getRandomElements(MOCK_PROFILES, likesCount);
    const commentsCount = getRandomInt(0, 10);
    const commenters = getRandomElements(MOCK_PROFILES, commentsCount);

    const post: Post = {
      id: i + 1,
      userId: author.id,
      author: {
        id: author.id,
        name: author.name,
        photo: author.photo
      },
      content: getRandomElement(POST_CONTENTS),
      images: Math.random() > 0.5 ? getRandomElement(POST_IMAGES) : [],
      likes: likers.map(p => p.id),
      comments: commenters.map((commenter, index) => ({
        id: index + 1,
        userId: commenter.id,
        content: "Super ! 👍",
        timestamp: new Date(now.getTime() - getRandomInt(0, 3600000)),
        likes: getRandomElements(MOCK_PROFILES, getRandomInt(0, 5)).map(p => p.id)
      })),
      timestamp: new Date(now.getTime() - getRandomInt(0, 86400000 * 7)), // jusqu'à 7 jours
      shares: getRandomInt(0, 20)
    };

    posts.push(post);
  }

  // Trier par date décroissante
  return posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const MOCK_POSTS = generateMockPosts(20);