export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      completed_tasks: {
        Row: {
          realized_estimation_score: number | null
          realized_importance_score: number | null
          realized_pride_score: number | null
          realized_urgency_score: number | null
          reflection: string | null
          task_id: number | null
        }
        Insert: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number | null
        }
        Update: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number | null
        }
      }
      objectives: {
        Row: {
          description: string | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: number
          importance?: Database["public"]["Enums"]["levels"]
          name?: string
          user_id?: string
        }
      }
      planned_tasks: {
        Row: {
          daily_agenda_index: number
          scheduled_date: string
          task_id: number
        }
        Insert: {
          daily_agenda_index: number
          scheduled_date: string
          task_id: number
        }
        Update: {
          daily_agenda_index?: number
          scheduled_date?: string
          task_id?: number
        }
      }
      state_history: {
        Row: {
          from_state: number
          time: string
          to_state: number
          user_id: string
        }
        Insert: {
          from_state: number
          time: string
          to_state: number
          user_id: string
        }
        Update: {
          from_state?: number
          time?: string
          to_state?: number
          user_id?: string
        }
      }
      states: {
        Row: {
          state_id: number
          table_name: string
        }
        Insert: {
          state_id: number
          table_name: string
        }
        Update: {
          state_id?: number
          table_name?: string
        }
      }
      step_blocks: {
        Row: {
          block_end: string
          block_start: string
          closed_by_completion: boolean
          id: number
          step_id: number | null
          work_block: number
        }
        Insert: {
          block_end: string
          block_start: string
          closed_by_completion: boolean
          id: number
          step_id?: number | null
          work_block: number
        }
        Update: {
          block_end?: string
          block_start?: string
          closed_by_completion?: boolean
          id?: number
          step_id?: number | null
          work_block?: number
        }
      }
      steps: {
        Row: {
          completed: boolean
          description: string | null
          name: string
          planedduration: unknown | null
          task_id: number
        }
        Insert: {
          completed: boolean
          description?: string | null
          name: string
          planedduration?: unknown | null
          task_id: number
        }
        Update: {
          completed?: boolean
          description?: string | null
          name?: string
          planedduration?: unknown | null
          task_id?: number
        }
      }
      task_objectives: {
        Row: {
          objective_id: number
          task_id: number
        }
        Insert: {
          objective_id: number
          task_id: number
        }
        Update: {
          objective_id?: number
          task_id?: number
        }
      }
      tasks: {
        Row: {
          additional_duration: unknown | null
          algo_urgency: Database["public"]["Enums"]["levels"] | null
          description: string | null
          due_date: string | null
          duration: unknown | null
          extra: unknown | null
          id: number
          importance: Database["public"]["Enums"]["levels"] | null
          name: string
          user_id: string
          user_urgency: Database["public"]["Enums"]["levels"] | null
        }
        Insert: {
          additional_duration?: unknown | null
          algo_urgency?: Database["public"]["Enums"]["levels"] | null
          description?: string | null
          due_date?: string | null
          duration?: unknown | null
          extra?: unknown | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
          user_urgency?: Database["public"]["Enums"]["levels"] | null
        }
        Update: {
          additional_duration?: unknown | null
          algo_urgency?: Database["public"]["Enums"]["levels"] | null
          description?: string | null
          due_date?: string | null
          duration?: unknown | null
          extra?: unknown | null
          id?: number
          importance?: Database["public"]["Enums"]["levels"]
          name?: string
          user_id?: string
          user_urgency?: Database["public"]["Enums"]["levels"] | null
        }
      }
      work_blocks: {
        Row: {
          actual_additional_duration: unknown
          id: number
          planned_additional_duration: unknown | null
          planned_extra: unknown | null
          task_id: number
          work_end: string
          work_start: string
        }
        Insert: {
          actual_additional_duration: unknown
          id: number
          planned_additional_duration?: unknown | null
          planned_extra?: unknown | null
          task_id: number
          work_end: string
          work_start: string
        }
        Update: {
          actual_additional_duration?: unknown
          id?: number
          planned_additional_duration?: unknown | null
          planned_extra?: unknown | null
          task_id?: number
          work_end?: string
          work_start?: string
        }
      }
      working_tasks: {
        Row: {
          start: string
          task_id: number
        }
        Insert: {
          start: string
          task_id: number
        }
        Update: {
          start?: string
          task_id?: number
        }
      }
      working_tasks_working_step: {
        Row: {
          working_step_id: number
          working_step_start_time: string | null
        }
        Insert: {
          working_step_id: number
          working_step_start_time?: string | null
        }
        Update: {
          working_step_id?: number
          working_step_start_time?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      levels: "high" | "low"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      completed_tasks: {
        Row: {
          realized_estimation_score: number | null
          realized_importance_score: number | null
          realized_pride_score: number | null
          realized_urgency_score: number | null
          reflection: string | null
          task_id: number | null
        }
        Insert: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number | null
        }
        Update: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number | null
        }
      }
      objectives: {
        Row: {
          description: string | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: number
          importance?: Database["public"]["Enums"]["levels"]
          name?: string
          user_id?: string
        }
      }
      planned_tasks: {
        Row: {
          daily_agenda_index: number
          scheduled_date: string
          task_id: number | null
        }
        Insert: {
          daily_agenda_index: number
          scheduled_date: string
          task_id?: number | null
        }
        Update: {
          daily_agenda_index?: number
          scheduled_date?: string
          task_id?: number | null
        }
      }
      state_history: {
        Row: {
          from_state: number
          time: string
          to_state: number
          user_id: string
        }
        Insert: {
          from_state: number
          time: string
          to_state: number
          user_id: string
        }
        Update: {
          from_state?: number
          time?: string
          to_state?: number
          user_id?: string
        }
      }
      states: {
        Row: {
          state_id: number
          table_name: string
        }
        Insert: {
          state_id: number
          table_name: string
        }
        Update: {
          state_id?: number
          table_name?: string
        }
      }
      step_blocks: {
        Row: {
          block_end: string
          block_start: string
          closed_by_completion: boolean
          id: number
          step_id: number | null
          work_block: number
        }
        Insert: {
          block_end: string
          block_start: string
          closed_by_completion: boolean
          id: number
          step_id?: number | null
          work_block: number
        }
        Update: {
          block_end?: string
          block_start?: string
          closed_by_completion?: boolean
          id?: number
          step_id?: number | null
          work_block?: number
        }
      }
      steps: {
        Row: {
          completed: boolean
          description: string | null
          id: number
          name: string
          planedduration: unknown | null
          task_id: number | null
        }
        Insert: {
          completed: boolean
          description?: string | null
          id: number
          name: string
          planedduration?: unknown | null
          task_id?: number | null
        }
        Update: {
          completed?: boolean
          description?: string | null
          id?: number
          name?: string
          planedduration?: unknown | null
          task_id?: number | null
        }
      }
      task_objectives: {
        Row: {
          objective_id: number
          task_id: number
        }
        Insert: {
          objective_id: number
          task_id: number
        }
        Update: {
          objective_id?: number
          task_id?: number
        }
      }
      tasks: {
        Row: {
          additional_duration: unknown | null
          description: string | null
          due_date: string | null
          duration: unknown | null
          extra: unknown | null
          id: number
          importance: Database["public"]["Enums"]["levels"] | null
          name: string
          user_id: string
          user_urgency: Database["public"]["Enums"]["levels"] | null
        }
        Insert: {
          additional_duration?: unknown | null
          description?: string | null
          due_date?: string | null
          duration?: unknown | null
          extra?: unknown | null
          id: number
          importance?: Database["public"]["Enums"]["levels"] | null
          name: string
          user_id: string
          user_urgency?: Database["public"]["Enums"]["levels"] | null
        }
        Update: {
          additional_duration?: unknown | null
          description?: string | null
          due_date?: string | null
          duration?: unknown | null
          extra?: unknown | null
          id?: number
          importance?: Database["public"]["Enums"]["levels"] | null
          name?: string
          user_id?: string
          user_urgency?: Database["public"]["Enums"]["levels"] | null
        }
      }
      work_blocks: {
        Row: {
          actual_additional_duration: unknown | null
          ended_by_completion: boolean
          id: number
          planned_additional_duration: unknown | null
          planned_extra: unknown | null
          task_id: number
          work_end: string
          work_start: string
        }
        Insert: {
          actual_additional_duration?: unknown | null
          ended_by_completion: boolean
          id: number
          planned_additional_duration?: unknown | null
          planned_extra?: unknown | null
          task_id: number
          work_end: string
          work_start: string
        }
        Update: {
          actual_additional_duration?: unknown | null
          ended_by_completion?: boolean
          id?: number
          planned_additional_duration?: unknown | null
          planned_extra?: unknown | null
          task_id?: number
          work_end?: string
          work_start?: string
        }
      }
      working_tasks: {
        Row: {
          start: string
          task_id: number
        }
        Insert: {
          start: string
          task_id: number
        }
        Update: {
          start?: string
          task_id?: number
        }
      }
      working_tasks_working_step: {
        Row: {
          working_step_id: number
          working_step_start_time: string | null
        }
        Insert: {
          working_step_id: number
          working_step_start_time?: string | null
        }
        Update: {
          working_step_id?: number
          working_step_start_time?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      levels: "high" | "low" | "none"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      completed_tasks: {
        Row: {
          realized_estimation_score: number | null
          realized_importance_score: number | null
          realized_pride_score: number | null
          realized_urgency_score: number | null
          reflection: string | null
          task_id: number | null
        }
        Insert: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number | null
        }
        Update: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number | null
        }
      }
      objectives: {
        Row: {
          description: string | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: number
          importance?: Database["public"]["Enums"]["levels"]
          name?: string
          user_id?: string
        }
      }
      planned_tasks: {
        Row: {
          daily_agenda_index: number
          scheduled_date: string
          task_id: number | null
        }
        Insert: {
          daily_agenda_index: number
          scheduled_date: string
          task_id?: number | null
        }
        Update: {
          daily_agenda_index?: number
          scheduled_date?: string
          task_id?: number | null
        }
      }
      state_history: {
        Row: {
          from_state: number
          time: string
          to_state: number
          user_id: string
        }
        Insert: {
          from_state: number
          time: string
          to_state: number
          user_id: string
        }
        Update: {
          from_state?: number
          time?: string
          to_state?: number
          user_id?: string
        }
      }
      states: {
        Row: {
          state_id: number
          table_name: string
        }
        Insert: {
          state_id: number
          table_name: string
        }
        Update: {
          state_id?: number
          table_name?: string
        }
      }
      step_blocks: {
        Row: {
          block_end: string
          block_start: string
          closed_by_completion: boolean
          id: number
          step_id: number | null
          work_block: number
        }
        Insert: {
          block_end: string
          block_start: string
          closed_by_completion: boolean
          id: number
          step_id?: number | null
          work_block: number
        }
        Update: {
          block_end?: string
          block_start?: string
          closed_by_completion?: boolean
          id?: number
          step_id?: number | null
          work_block?: number
        }
      }
      steps: {
        Row: {
          completed: boolean
          description: string | null
          id: number
          name: string
          planedduration: unknown | null
          task_id: number | null
        }
        Insert: {
          completed: boolean
          description?: string | null
          id: number
          name: string
          planedduration?: unknown | null
          task_id?: number | null
        }
        Update: {
          completed?: boolean
          description?: string | null
          id?: number
          name?: string
          planedduration?: unknown | null
          task_id?: number | null
        }
      }
      task_objectives: {
        Row: {
          objective_id: number
          task_id: number
        }
        Insert: {
          objective_id: number
          task_id: number
        }
        Update: {
          objective_id?: number
          task_id?: number
        }
      }
      tasks: {
        Row: {
          additional_duration: unknown | null
          description: string | null
          due_date: string | null
          duration: unknown | null
          extra: unknown | null
          id: number
          importance: Database["public"]["Enums"]["levels"] | null
          name: string
          user_id: string
          user_urgency: Database["public"]["Enums"]["levels"] | null
        }
        Insert: {
          additional_duration?: unknown | null
          description?: string | null
          due_date?: string | null
          duration?: unknown | null
          extra?: unknown | null
          id: number
          importance?: Database["public"]["Enums"]["levels"] | null
          name: string
          user_id: string
          user_urgency?: Database["public"]["Enums"]["levels"] | null
        }
        Update: {
          additional_duration?: unknown | null
          description?: string | null
          due_date?: string | null
          duration?: unknown | null
          extra?: unknown | null
          id?: number
          importance?: Database["public"]["Enums"]["levels"] | null
          name?: string
          user_id?: string
          user_urgency?: Database["public"]["Enums"]["levels"] | null
        }
      }
      work_blocks: {
        Row: {
          actual_additional_duration: unknown | null
          ended_by_completion: boolean
          id: number
          planned_additional_duration: unknown | null
          planned_extra: unknown | null
          task_id: number
          work_end: string
          work_start: string
        }
        Insert: {
          actual_additional_duration?: unknown | null
          ended_by_completion: boolean
          id: number
          planned_additional_duration?: unknown | null
          planned_extra?: unknown | null
          task_id: number
          work_end: string
          work_start: string
        }
        Update: {
          actual_additional_duration?: unknown | null
          ended_by_completion?: boolean
          id?: number
          planned_additional_duration?: unknown | null
          planned_extra?: unknown | null
          task_id?: number
          work_end?: string
          work_start?: string
        }
      }
      working_tasks: {
        Row: {
          start: string
          task_id: number
        }
        Insert: {
          start: string
          task_id: number
        }
        Update: {
          start?: string
          task_id?: number
        }
      }
      working_tasks_working_step: {
        Row: {
          working_step_id: number
          working_step_start_time: string | null
        }
        Insert: {
          working_step_id: number
          working_step_start_time?: string | null
        }
        Update: {
          working_step_id?: number
          working_step_start_time?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      levels: "high" | "low"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      completed_tasks: {
        Row: {
          realized_estimation_score: number | null
          realized_importance_score: number | null
          realized_pride_score: number | null
          realized_urgency_score: number | null
          reflection: string | null
          task_id: number | null
        }
        Insert: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number | null
        }
        Update: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number | null
        }
      }
      objectives: {
        Row: {
          description: string | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: number
          importance?: Database["public"]["Enums"]["levels"]
          name?: string
          user_id?: string
        }
      }
      planned_tasks: {
        Row: {
          daily_agenda_index: number
          scheduled_date: string
          task_id: number | null
        }
        Insert: {
          daily_agenda_index: number
          scheduled_date: string
          task_id?: number | null
        }
        Update: {
          daily_agenda_index?: number
          scheduled_date?: string
          task_id?: number | null
        }
      }
      state_history: {
        Row: {
          from_state: number
          time: string
          to_state: number
          user_id: string
        }
        Insert: {
          from_state: number
          time: string
          to_state: number
          user_id: string
        }
        Update: {
          from_state?: number
          time?: string
          to_state?: number
          user_id?: string
        }
      }
      states: {
        Row: {
          state_id: number
          table_name: string
        }
        Insert: {
          state_id: number
          table_name: string
        }
        Update: {
          state_id?: number
          table_name?: string
        }
      }
      step_blocks: {
        Row: {
          block_end: string
          block_start: string
          closed_by_completion: boolean
          id: number
          step_id: number | null
          work_block: number
        }
        Insert: {
          block_end: string
          block_start: string
          closed_by_completion: boolean
          id: number
          step_id?: number | null
          work_block: number
        }
        Update: {
          block_end?: string
          block_start?: string
          closed_by_completion?: boolean
          id?: number
          step_id?: number | null
          work_block?: number
        }
      }
      steps: {
        Row: {
          completed: boolean
          description: string | null
          id: number
          name: string
          planedduration: unknown | null
          task_id: number | null
        }
        Insert: {
          completed: boolean
          description?: string | null
          id: number
          name: string
          planedduration?: unknown | null
          task_id?: number | null
        }
        Update: {
          completed?: boolean
          description?: string | null
          id?: number
          name?: string
          planedduration?: unknown | null
          task_id?: number | null
        }
      }
      task_objectives: {
        Row: {
          objective_id: number
          task_id: number
        }
        Insert: {
          objective_id: number
          task_id: number
        }
        Update: {
          objective_id?: number
          task_id?: number
        }
      }
      tasks: {
        Row: {
          additional_duration: unknown | null
          description: string | null
          due_date: string | null
          duration: unknown | null
          extra: unknown | null
          id: number
          importance: Database["public"]["Enums"]["levels"] | null
          name: string
          user_id: string
          user_urgency: Database["public"]["Enums"]["levels"] | null
        }
        Insert: {
          additional_duration?: unknown | null
          description?: string | null
          due_date?: string | null
          duration?: unknown | null
          extra?: unknown | null
          id: number
          importance?: Database["public"]["Enums"]["levels"] | null
          name: string
          user_id: string
          user_urgency?: Database["public"]["Enums"]["levels"] | null
        }
        Update: {
          additional_duration?: unknown | null
          description?: string | null
          due_date?: string | null
          duration?: unknown | null
          extra?: unknown | null
          id?: number
          importance?: Database["public"]["Enums"]["levels"] | null
          name?: string
          user_id?: string
          user_urgency?: Database["public"]["Enums"]["levels"] | null
        }
      }
      work_blocks: {
        Row: {
          actual_additional_duration: unknown | null
          ended_by_completion: boolean
          id: number
          planned_additional_duration: unknown | null
          planned_extra: unknown | null
          task_id: number
          work_end: string
          work_start: string
        }
        Insert: {
          actual_additional_duration?: unknown | null
          ended_by_completion: boolean
          id: number
          planned_additional_duration?: unknown | null
          planned_extra?: unknown | null
          task_id: number
          work_end: string
          work_start: string
        }
        Update: {
          actual_additional_duration?: unknown | null
          ended_by_completion?: boolean
          id?: number
          planned_additional_duration?: unknown | null
          planned_extra?: unknown | null
          task_id?: number
          work_end?: string
          work_start?: string
        }
      }
      working_tasks: {
        Row: {
          start: string
          task_id: number
        }
        Insert: {
          start: string
          task_id: number
        }
        Update: {
          start?: string
          task_id?: number
        }
      }
      working_tasks_working_step: {
        Row: {
          working_step_id: number
          working_step_start_time: string | null
        }
        Insert: {
          working_step_id: number
          working_step_start_time?: string | null
        }
        Update: {
          working_step_id?: number
          working_step_start_time?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      levels: "high" | "low"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      completed_tasks: {
        Row: {
          realized_estimation_score: number | null
          realized_importance_score: number | null
          realized_pride_score: number | null
          realized_urgency_score: number | null
          reflection: string | null
          task_id: number | null
        }
        Insert: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number | null
        }
        Update: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number | null
        }
      }
      objectives: {
        Row: {
          description: string | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id: number
          importance: Database["public"]["Enums"]["levels"]
          name: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: number
          importance?: Database["public"]["Enums"]["levels"]
          name?: string
          user_id?: string
        }
      }
      planned_tasks: {
        Row: {
          daily_agenda_index: number
          scheduled_date: string
          task_id: number | null
        }
        Insert: {
          daily_agenda_index: number
          scheduled_date: string
          task_id?: number | null
        }
        Update: {
          daily_agenda_index?: number
          scheduled_date?: string
          task_id?: number | null
        }
      }
      state_history: {
        Row: {
          from_state: number
          time: string
          to_state: number
          user_id: string
        }
        Insert: {
          from_state: number
          time: string
          to_state: number
          user_id: string
        }
        Update: {
          from_state?: number
          time?: string
          to_state?: number
          user_id?: string
        }
      }
      states: {
        Row: {
          state_id: number
          table_name: string
        }
        Insert: {
          state_id: number
          table_name: string
        }
        Update: {
          state_id?: number
          table_name?: string
        }
      }
      step_blocks: {
        Row: {
          block_end: string
          block_start: string
          closed_by_completion: boolean
          id: number
          step_id: number | null
          work_block: number
        }
        Insert: {
          block_end: string
          block_start: string
          closed_by_completion: boolean
          id: number
          step_id?: number | null
          work_block: number
        }
        Update: {
          block_end?: string
          block_start?: string
          closed_by_completion?: boolean
          id?: number
          step_id?: number | null
          work_block?: number
        }
      }
      steps: {
        Row: {
          completed: boolean
          description: string | null
          id: number
          name: string
          planedduration: unknown | null
          task_id: number | null
        }
        Insert: {
          completed: boolean
          description?: string | null
          id: number
          name: string
          planedduration?: unknown | null
          task_id?: number | null
        }
        Update: {
          completed?: boolean
          description?: string | null
          id?: number
          name?: string
          planedduration?: unknown | null
          task_id?: number | null
        }
      }
      task_objectives: {
        Row: {
          objective_id: number
          task_id: number
        }
        Insert: {
          objective_id: number
          task_id: number
        }
        Update: {
          objective_id?: number
          task_id?: number
        }
      }
      tasks: {
        Row: {
          additional_duration: unknown | null
          description: string | null
          due_date: string | null
          duration: unknown | null
          extra: unknown | null
          id: number
          importance: Database["public"]["Enums"]["levels"] | null
          name: string
          user_id: string
          user_urgency: Database["public"]["Enums"]["levels"] | null
        }
        Insert: {
          additional_duration?: unknown | null
          description?: string | null
          due_date?: string | null
          duration?: unknown | null
          extra?: unknown | null
          id: number
          importance?: Database["public"]["Enums"]["levels"] | null
          name: string
          user_id: string
          user_urgency?: Database["public"]["Enums"]["levels"] | null
        }
        Update: {
          additional_duration?: unknown | null
          description?: string | null
          due_date?: string | null
          duration?: unknown | null
          extra?: unknown | null
          id?: number
          importance?: Database["public"]["Enums"]["levels"] | null
          name?: string
          user_id?: string
          user_urgency?: Database["public"]["Enums"]["levels"] | null
        }
      }
      work_blocks: {
        Row: {
          actual_additional_duration: unknown | null
          ended_by_completion: boolean
          id: number
          planned_additional_duration: unknown | null
          planned_extra: unknown | null
          task_id: number
          work_end: string
          work_start: string
        }
        Insert: {
          actual_additional_duration?: unknown | null
          ended_by_completion: boolean
          id: number
          planned_additional_duration?: unknown | null
          planned_extra?: unknown | null
          task_id: number
          work_end: string
          work_start: string
        }
        Update: {
          actual_additional_duration?: unknown | null
          ended_by_completion?: boolean
          id?: number
          planned_additional_duration?: unknown | null
          planned_extra?: unknown | null
          task_id?: number
          work_end?: string
          work_start?: string
        }
      }
      working_tasks: {
        Row: {
          start: string
          task_id: number
        }
        Insert: {
          start: string
          task_id: number
        }
        Update: {
          start?: string
          task_id?: number
        }
      }
      working_tasks_working_step: {
        Row: {
          working_step_id: number
          working_step_start_time: string | null
        }
        Insert: {
          working_step_id: number
          working_step_start_time?: string | null
        }
        Update: {
          working_step_id?: number
          working_step_start_time?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      levels: "high" | "low"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

