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
      conversation_logs: {
        Row: {
          id: string
          user_id: string
          user_message: string
          ai_response: string
          request_mode_enabled: boolean
          task_generated: Json | null
          webhook_sent: boolean
          webhook_response: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_message: string
          ai_response: string
          request_mode_enabled: boolean
          task_generated?: Json | null
          webhook_sent: boolean
          webhook_response?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_message?: string
          ai_response?: string
          request_mode_enabled?: boolean
          task_generated?: Json | null
          webhook_sent?: boolean
          webhook_response?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          employee_name: string
          department: string
          role: string
          session_start: string
          session_end: string | null
          total_interactions: number
        }
        Insert: {
          id?: string
          user_id: string
          employee_name: string
          department: string
          role: string
          session_start?: string
          session_end?: string | null
          total_interactions?: number
        }
        Update: {
          id?: string
          user_id?: string
          employee_name?: string
          department?: string
          role?: string
          session_start?: string
          session_end?: string | null
          total_interactions?: number
        }
      }
      document_store: {
        Row: {
          id: string
          title: string
          content: string
          type: 'policy' | 'procedure' | 'guideline' | 'memo' | 'report'
          department: string | null
          author: string
          date_created: string
          last_updated: string
          is_active: boolean
          access_level: 'public' | 'management' | 'executive'
        }
        Insert: {
          id?: string
          title: string
          content: string
          type: 'policy' | 'procedure' | 'guideline' | 'memo' | 'report'
          department?: string | null
          author: string
          date_created?: string
          last_updated?: string
          is_active?: boolean
          access_level: 'public' | 'management' | 'executive'
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: 'policy' | 'procedure' | 'guideline' | 'memo' | 'report'
          department?: string | null
          author?: string
          date_created?: string
          last_updated?: string
          is_active?: boolean
          access_level?: 'public' | 'management' | 'executive'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_interaction_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}