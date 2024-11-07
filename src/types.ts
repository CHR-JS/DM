export type NotificationType = 'match' | 'message' | 'like' | 'follow' | 'comment' | 'nearby';

export interface Profile {
  id: number;
  name: string;
  age?: number;
  university?: string;
  photo: string;
  coverPhoto?: string;
  distance?: number;
  bio?: string;
  interests?: string[];
  photos?: string[];
  course?: string;
  yearOfStudy?: number;
  followers?: number[];
  following?: number[];
}

export interface Author {
  id: number;
  name: string;
  photo: string;
}

export interface Post {
  id: number;
  userId: number;
  author: Author;
  content: string;
  images?: string[];
  video?: string;
  likes: number[];
  comments: Comment[];
  timestamp: Date;
  shares: number;
}

export interface Comment {
  id: number;
  userId: number;
  content: string;
  timestamp: Date;
  likes: number[];
}

export interface Notification {
  id: number;
  type: NotificationType;
  userId: number;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
  read: boolean;
}