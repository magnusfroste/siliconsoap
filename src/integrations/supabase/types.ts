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
      agent_chat_messages: {
        Row: {
          agent: string
          chat_id: string
          created_at: string | null
          id: string
          message: string
          model: string
          persona: string
        }
        Insert: {
          agent: string
          chat_id: string
          created_at?: string | null
          id?: string
          message: string
          model: string
          persona: string
        }
        Update: {
          agent?: string
          chat_id?: string
          created_at?: string | null
          id?: string
          message?: string
          model?: string
          persona?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "agent_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_chats: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_public: boolean | null
          prompt: string
          scenario_id: string
          settings: Json | null
          share_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          view_count: number
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_public?: boolean | null
          prompt: string
          scenario_id: string
          settings?: Json | null
          share_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_public?: boolean | null
          prompt?: string
          scenario_id?: string
          settings?: Json | null
          share_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number
        }
        Relationships: []
      }
      agent_profiles: {
        Row: {
          created_at: string | null
          description: string
          icon_name: string
          id: string
          instructions: string
          is_premium: boolean | null
          is_system: boolean | null
          name: string
          slug: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon_name: string
          id?: string
          instructions: string
          is_premium?: boolean | null
          is_system?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon_name?: string
          id?: string
          instructions?: string
          is_premium?: boolean | null
          is_system?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_analytics: {
        Row: {
          chat_id: string | null
          completed_at: string | null
          created_at: string | null
          estimated_cost: number | null
          generation_duration_ms: number | null
          id: string
          is_guest: boolean | null
          models_used: string[] | null
          num_agents: number | null
          num_rounds: number | null
          prompt_preview: string | null
          scenario_id: string | null
          started_at: string | null
          total_messages: number | null
          total_tokens_used: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          generation_duration_ms?: number | null
          id?: string
          is_guest?: boolean | null
          models_used?: string[] | null
          num_agents?: number | null
          num_rounds?: number | null
          prompt_preview?: string | null
          scenario_id?: string | null
          started_at?: string | null
          total_messages?: number | null
          total_tokens_used?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          generation_duration_ms?: number | null
          id?: string
          is_guest?: boolean | null
          models_used?: string[] | null
          num_agents?: number | null
          num_rounds?: number | null
          prompt_preview?: string | null
          scenario_id?: string | null
          started_at?: string | null
          total_messages?: number | null
          total_tokens_used?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_analytics_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "agent_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          share_id: string
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          share_id: string
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          share_id?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      curated_models: {
        Row: {
          avoid_cases: string[] | null
          category: string | null
          cons: string[] | null
          context_window: number | null
          created_at: string
          default_for_agent: string | null
          description: string | null
          display_name: string
          id: string
          is_enabled: boolean
          is_free: boolean
          model_id: string
          pros: string[] | null
          provider: string
          sort_order: number
          speed_rating: string | null
          updated_at: string
          use_cases: string[] | null
        }
        Insert: {
          avoid_cases?: string[] | null
          category?: string | null
          cons?: string[] | null
          context_window?: number | null
          created_at?: string
          default_for_agent?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_enabled?: boolean
          is_free?: boolean
          model_id: string
          pros?: string[] | null
          provider: string
          sort_order?: number
          speed_rating?: string | null
          updated_at?: string
          use_cases?: string[] | null
        }
        Update: {
          avoid_cases?: string[] | null
          category?: string | null
          cons?: string[] | null
          context_window?: number | null
          created_at?: string
          default_for_agent?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_enabled?: boolean
          is_free?: boolean
          model_id?: string
          pros?: string[] | null
          provider?: string
          sort_order?: number
          speed_rating?: string | null
          updated_at?: string
          use_cases?: string[] | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          key: string
          name: string
          numeric_value: number | null
          text_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          key: string
          name: string
          numeric_value?: number | null
          text_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          key?: string
          name?: string
          numeric_value?: number | null
          text_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits_remaining: number
          credits_used: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_remaining?: number
          credits_used?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_remaining?: number
          credits_used?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_shared_chat: {
        Args: { p_share_id: string }
        Returns: {
          created_at: string
          deleted_at: string
          id: string
          is_public: boolean
          prompt: string
          scenario_id: string
          settings: Json
          share_id: string
          title: string
          updated_at: string
          view_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_chat_view_count: {
        Args: { p_share_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
