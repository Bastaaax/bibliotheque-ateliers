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
          id: string
          email: string
          full_name: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workshops: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          duration_minutes: number | null
          participants_min: number | null
          participants_max: number | null
          materials: Json
          objectives: Json
          creator_id: string | null
          created_at: string
          updated_at: string
          source: string
          source_id: string | null
          source_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: string | null
          duration_minutes?: number | null
          participants_min?: number | null
          participants_max?: number | null
          materials?: Json
          objectives?: Json
          creator_id?: string | null
          created_at?: string
          updated_at?: string
          source?: string
          source_id?: string | null
          source_url?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          content?: string | null
          duration_minutes?: number | null
          participants_min?: number | null
          participants_max?: number | null
          materials?: Json
          objectives?: Json
          creator_id?: string | null
          updated_at?: string
          source?: string
          source_id?: string | null
          source_url?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          category: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string
          color?: string
          created_at?: string
        }
        Update: {
          name?: string
          category?: string
          color?: string
        }
      }
      workshop_tags: {
        Row: {
          workshop_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          workshop_id: string
          tag_id: string
          created_at?: string
        }
        Update: never
      }
      attachments: {
        Row: {
          id: string
          workshop_id: string
          file_name: string
          file_path: string
          file_type: string | null
          file_size: number | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workshop_id: string
          file_name: string
          file_path: string
          file_type?: string | null
          file_size?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          file_name?: string
          file_path?: string
        }
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          type: string
          access_token: string | null
          refresh_token: string | null
          config: Json
          last_sync: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          access_token?: string | null
          refresh_token?: string | null
          config?: Json
          last_sync?: string | null
          created_at?: string
        }
        Update: {
          access_token?: string | null
          refresh_token?: string | null
          config?: Json
          last_sync?: string | null
        }
      }
      invitations: {
        Row: {
          id: string
          email: string
          role: string
          invited_by: string | null
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: string
          invited_by?: string | null
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          accepted_at?: string | null
        }
      }
    }
    Functions: {
      search_workshops: {
        Args: { search_query: string }
        Returns: { id: string; title: string; description: string | null; rank: number }[]
      }
    }
  }
}
