export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
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
          task_id: number
        }
        Insert: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id: number
        }
        Update: {
          realized_estimation_score?: number | null
          realized_importance_score?: number | null
          realized_pride_score?: number | null
          realized_urgency_score?: number | null
          reflection?: string | null
          task_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "completed_tasks_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "objectives_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "planned_tasks_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "state_history_from_state_fkey"
            columns: ["from_state"]
            referencedRelation: "states"
            referencedColumns: ["state_id"]
          },
          {
            foreignKeyName: "state_history_to_state_fkey"
            columns: ["to_state"]
            referencedRelation: "states"
            referencedColumns: ["state_id"]
          },
          {
            foreignKeyName: "state_history_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "step_blocks_step_id_fkey"
            columns: ["step_id"]
            referencedRelation: "steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_blocks_work_block_fkey"
            columns: ["work_block"]
            referencedRelation: "work_blocks"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "steps_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "task_objectives_objective_id_fkey"
            columns: ["objective_id"]
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_objectives_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "work_blocks_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "working_tasks_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "working_tasks_working_step_working_step_id_fkey"
            columns: ["working_step_id"]
            referencedRelation: "steps"
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
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
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
        Returns: unknown
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

