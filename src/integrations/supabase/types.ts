export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_access: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_access_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_usage_stats"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_access_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agent_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      agent_access_requests: {
        Row: {
          agent_id: string
          created_at: string | null
          decided_at: string | null
          decided_by: string | null
          id: string
          message: string | null
          requested_by: string
          status: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          message?: string | null
          requested_by: string
          status?: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          message?: string | null
          requested_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_access_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_usage_stats"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_access_requests_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_access_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agent_access_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "user_usage_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agent_access_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agent_access_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "user_usage_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      agent_ratings: {
        Row: {
          accuracy: number | null
          agent_id: string
          created_at: string
          feedback_tags: string[] | null
          feedback_text: string | null
          id: string
          rating_type: string
          response_speed: number | null
          session_id: string | null
          updated_at: string
          user_id: string | null
          voice_naturality: number | null
        }
        Insert: {
          accuracy?: number | null
          agent_id: string
          created_at?: string
          feedback_tags?: string[] | null
          feedback_text?: string | null
          id?: string
          rating_type: string
          response_speed?: number | null
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
          voice_naturality?: number | null
        }
        Update: {
          accuracy?: number | null
          agent_id?: string
          created_at?: string
          feedback_tags?: string[] | null
          feedback_text?: string | null
          id?: string
          rating_type?: string
          response_speed?: number | null
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
          voice_naturality?: number | null
        }
        Relationships: []
      }
      agent_submissions: {
        Row: {
          agent_id: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          id: string
          notes: string | null
          status: string
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          agent_id: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          id?: string
          notes?: string | null
          status?: string
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          agent_id?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          id?: string
          notes?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_submissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_usage_stats"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "agent_submissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_submissions_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agent_submissions_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "user_usage_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agent_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agent_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "user_usage_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      agents: {
        Row: {
          access_mode: string | null
          agent_price: number | null
          avatar_url: string
          average_rating: number | null
          category: string
          created_at: string
          id: string
          instructions_override: string | null
          is_featured: boolean | null
          language: string[]
          model: string
          name: string
          owner_user_id: string | null
          prompt_id: string | null
          prompt_source: string
          prompt_text: string | null
          prompt_variables: Json | null
          prompt_version: string | null
          provider: string | null
          provider_config: Json | null
          rating: number | null
          settings: Json | null
          short_desc: string | null
          slug: string | null
          status: string | null
          status_type: string | null
          tagline: string
          tags: string[] | null
          total_ratings: number | null
          total_thumbs_down: number | null
          total_thumbs_up: number | null
          updated_at: string
          visibility: string | null
          voice: string
        }
        Insert: {
          access_mode?: string | null
          agent_price?: number | null
          avatar_url: string
          average_rating?: number | null
          category: string
          created_at?: string
          id?: string
          instructions_override?: string | null
          is_featured?: boolean | null
          language: string[]
          model?: string
          name: string
          owner_user_id?: string | null
          prompt_id?: string | null
          prompt_source: string
          prompt_text?: string | null
          prompt_variables?: Json | null
          prompt_version?: string | null
          provider?: string | null
          provider_config?: Json | null
          rating?: number | null
          settings?: Json | null
          short_desc?: string | null
          slug?: string | null
          status?: string | null
          status_type?: string | null
          tagline: string
          tags?: string[] | null
          total_ratings?: number | null
          total_thumbs_down?: number | null
          total_thumbs_up?: number | null
          updated_at?: string
          visibility?: string | null
          voice: string
        }
        Update: {
          access_mode?: string | null
          agent_price?: number | null
          avatar_url?: string
          average_rating?: number | null
          category?: string
          created_at?: string
          id?: string
          instructions_override?: string | null
          is_featured?: boolean | null
          language?: string[]
          model?: string
          name?: string
          owner_user_id?: string | null
          prompt_id?: string | null
          prompt_source?: string
          prompt_text?: string | null
          prompt_variables?: Json | null
          prompt_version?: string | null
          provider?: string | null
          provider_config?: Json | null
          rating?: number | null
          settings?: Json | null
          short_desc?: string | null
          slug?: string | null
          status?: string | null
          status_type?: string | null
          tagline?: string
          tags?: string[] | null
          total_ratings?: number | null
          total_thumbs_down?: number | null
          total_thumbs_up?: number | null
          updated_at?: string
          visibility?: string | null
          voice?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agents_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversation_sessions: {
        Row: {
          agent_id: string | null
          cached_input_tokens: number | null
          created_at: string | null
          duration_ms: number | null
          ended_at: string | null
          id: string
          input_tokens: number | null
          metadata: Json | null
          model: string | null
          output_tokens: number | null
          session_id: string | null
          started_at: string
          status: string | null
          total_tokens: number | null
          transcript: Json | null
          transport: string | null
          turns: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          cached_input_tokens?: number | null
          created_at?: string | null
          duration_ms?: number | null
          ended_at?: string | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          output_tokens?: number | null
          session_id?: string | null
          started_at?: string
          status?: string | null
          total_tokens?: number | null
          transcript?: Json | null
          transport?: string | null
          turns?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          cached_input_tokens?: number | null
          created_at?: string | null
          duration_ms?: number | null
          ended_at?: string | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          output_tokens?: number | null
          session_id?: string | null
          started_at?: string
          status?: string | null
          total_tokens?: number | null
          transcript?: Json | null
          transport?: string | null
          turns?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_usage_stats"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "conversation_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_turns: {
        Row: {
          assistant_text: string | null
          cached_input_tokens: number | null
          completed_at: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          input_tokens: number | null
          output_tokens: number | null
          raw_meta: Json | null
          raw_usage: Json | null
          started_at: string | null
          turn_index: number
          user_text: string | null
        }
        Insert: {
          assistant_text?: string | null
          cached_input_tokens?: number | null
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          input_tokens?: number | null
          output_tokens?: number | null
          raw_meta?: Json | null
          raw_usage?: Json | null
          started_at?: string | null
          turn_index: number
          user_text?: string | null
        }
        Update: {
          assistant_text?: string | null
          cached_input_tokens?: number | null
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          input_tokens?: number | null
          output_tokens?: number | null
          raw_meta?: Json | null
          raw_usage?: Json | null
          started_at?: string | null
          turn_index?: number
          user_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_turns_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string
          created_at: string
          ended_at: string | null
          id: string
          started_at: string
          status: string
          transcript: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          transcript?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          transcript?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_usage_stats"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          updated_at: string
          uses_remaining: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
          uses_remaining?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          updated_at?: string
          uses_remaining?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_super_admin: boolean | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_super_admin?: boolean | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_super_admin?: boolean | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      agent_listeners: {
        Row: {
          agent_id: string | null
          first_seen: string | null
          last_seen: string | null
          minutes: number | null
          sessions: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_usage_stats"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "conversation_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_usage_stats: {
        Row: {
          agent_id: string | null
          cached_tokens: number | null
          conversations: number | null
          input_tokens: number | null
          minutes: number | null
          name: string | null
          output_tokens: number | null
          owner_user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agents_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "user_usage_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_usage_stats: {
        Row: {
          conversations_count: number | null
          email: string | null
          full_name: string | null
          is_admin: boolean | null
          is_super_admin: boolean | null
          total_cached_tokens: number | null
          total_input_tokens: number | null
          total_minutes: number | null
          total_output_tokens: number | null
          user_created_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin_user: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_super_admin_user: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      use_invite_code: {
        Args: { code_to_use: string }
        Returns: Json
      }
      validate_invite_code: {
        Args: { code_to_check: string }
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
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
