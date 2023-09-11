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
      completed_tasks: {
        Row: {
          completed_time: string
          id: string
          ref_task: string
          start_time: string
          urgency: string
          user_id: string
        }
        Insert: {
          completed_time: string
          id: string
          ref_task: string
          start_time: string
          urgency: string
          user_id: string
        }
        Update: {
          completed_time?: string
          id?: string
          ref_task?: string
          start_time?: string
          urgency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_tasks_ref_task_fkey"
            columns: ["ref_task"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      goals: {
        Row: {
          description: string | null
          id: string
          importance: string
          name: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id: string
          importance: string
          name: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: string
          importance?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          description: string | null
          due_date: string
          duration: number
          goals: string[] | null
          id: string
          importance: string
          name: string
          start_date: string | null
          steps: Json[] | null
          user_id: string
        }
        Insert: {
          description?: string | null
          due_date: string
          duration: number
          goals?: string[] | null
          id: string
          importance: string
          name: string
          start_date?: string | null
          steps?: Json[] | null
          user_id: string
        }
        Update: {
          description?: string | null
          due_date?: string
          duration?: number
          goals?: string[] | null
          id?: string
          importance?: string
          name?: string
          start_date?: string | null
          steps?: Json[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          end_time: number
          start_time: number
          user_id: string
        }
        Insert: {
          end_time: number
          start_time: number
          user_id: string
        }
        Update: {
          end_time?: number
          start_time?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      working_tasks: {
        Row: {
          end_time: string
          id: string
          ref_task: string
          start_time: string
          urgency: string
          user_id: string
        }
        Insert: {
          end_time: string
          id: string
          ref_task: string
          start_time: string
          urgency: string
          user_id: string
        }
        Update: {
          end_time?: string
          id?: string
          ref_task?: string
          start_time?: string
          urgency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_tasks_ref_task_fkey"
            columns: ["ref_task"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "working_tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
