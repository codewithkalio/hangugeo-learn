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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      conjugation_results: {
        Row: {
          correct_first: number
          correct_second: number
          date: string
          id: string
          incorrect: number
          questions: Json
          total_questions: number
          user_id: string
        }
        Insert: {
          correct_first: number
          correct_second: number
          date?: string
          id?: string
          incorrect: number
          questions: Json
          total_questions: number
          user_id: string
        }
        Update: {
          correct_first?: number
          correct_second?: number
          date?: string
          id?: string
          incorrect?: number
          questions?: Json
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      drill_results: {
        Row: {
          cards: Json
          category: string | null
          correct_count: number
          date: string
          direction: string
          id: string
          total_cards: number
          user_id: string
        }
        Insert: {
          cards: Json
          category?: string | null
          correct_count: number
          date?: string
          direction: string
          id?: string
          total_cards: number
          user_id: string
        }
        Update: {
          cards?: Json
          category?: string | null
          correct_count?: number
          date?: string
          direction?: string
          id?: string
          total_cards?: number
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          category: string | null
          confidence_score: number
          consecutive_fluent: number
          correct_count: number
          created_at: string
          english: string
          id: string
          incorrect_count: number
          korean: string
          note: string | null
          user_id: string
          weight: number
        }
        Insert: {
          category?: string | null
          confidence_score?: number
          consecutive_fluent?: number
          correct_count?: number
          created_at?: string
          english: string
          id?: string
          incorrect_count?: number
          korean: string
          note?: string | null
          user_id: string
          weight?: number
        }
        Update: {
          category?: string | null
          confidence_score?: number
          consecutive_fluent?: number
          correct_count?: number
          created_at?: string
          english?: string
          id?: string
          incorrect_count?: number
          korean?: string
          note?: string | null
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      grammar_patterns: {
        Row: {
          confidence_score: number
          consecutive_fluent: number
          correct_first_attempt: number
          correct_second_attempt: number
          enabled: boolean
          id: string
          last_practiced_at: string | null
          pattern_key: string
          times_practiced: number
          total_attempts: number
          user_id: string
          weight: number
        }
        Insert: {
          confidence_score?: number
          consecutive_fluent?: number
          correct_first_attempt?: number
          correct_second_attempt?: number
          enabled?: boolean
          id?: string
          last_practiced_at?: string | null
          pattern_key: string
          times_practiced?: number
          total_attempts?: number
          user_id: string
          weight?: number
        }
        Update: {
          confidence_score?: number
          consecutive_fluent?: number
          correct_first_attempt?: number
          correct_second_attempt?: number
          enabled?: boolean
          id?: string
          last_practiced_at?: string | null
          pattern_key?: string
          times_practiced?: number
          total_attempts?: number
          user_id?: string
          weight?: number
        }
        Relationships: []
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
