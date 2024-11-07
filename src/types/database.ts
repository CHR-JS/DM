export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: number
          name: string
          age: number
          university: string
          photo: string
          cover_photo: string | null
          distance: number
          bio: string
          interests: string[]
          photos: string[]
          course: string | null
          year_of_study: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          age: number
          university: string
          photo: string
          cover_photo?: string | null
          distance: number
          bio: string
          interests: string[]
          photos: string[]
          course?: string | null
          year_of_study?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          age?: number
          university?: string
          photo?: string
          cover_photo?: string | null
          distance?: number
          bio?: string
          interests?: string[]
          photos?: string[]
          course?: string | null
          year_of_study?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: number
          user_id: number
          content: string
          images: string[] | null
          video: string | null
          likes: number[]
          shares: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: number
          content: string
          images?: string[] | null
          video?: string | null
          likes?: number[]
          shares?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          content?: string
          images?: string[] | null
          video?: string | null
          likes?: number[]
          shares?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          post_id: number
          user_id: number
          content: string
          likes: number[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          post_id: number
          user_id: number
          content: string
          likes?: number[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          post_id?: number
          user_id?: number
          content?: string
          likes?: number[]
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: number
          following_id: number
          created_at: string
        }
        Insert: {
          follower_id: number
          following_id: number
          created_at?: string
        }
        Update: {
          follower_id?: number
          following_id?: number
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          sender_id: number
          receiver_id: number
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          sender_id: number
          receiver_id: number
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          sender_id?: number
          receiver_id?: number
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: number
          type: 'match' | 'message' | 'like' | 'follow' | 'comment'
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          type: 'match' | 'message' | 'like' | 'follow' | 'comment'
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          type?: 'match' | 'message' | 'like' | 'follow' | 'comment'
          content?: string
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}