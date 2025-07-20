export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badges: string[] | null
          calls_attended: number | null
          created_at: string
          id: string
          last_activity: string | null
          points: number
          rank: number | null
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          badges?: string[] | null
          calls_attended?: number | null
          created_at?: string
          id?: string
          last_activity?: string | null
          points?: number
          rank?: number | null
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          badges?: string[] | null
          calls_attended?: number | null
          created_at?: string
          id?: string
          last_activity?: string | null
          points?: number
          rank?: number | null
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      facilitators: {
        Row: {
          badge_urls: Json | null
          badges_achieved: string[] | null
          bio: string
          brand_name: string | null
          created_at: string
          email: string
          expertise: string[] | null
          id: string
          image: string | null
          is_visible: boolean
          key_achievements: string[] | null
          lives_impacted: number | null
          location: string | null
          membership_level: string | null
          name: string
          phone: string | null
          role: string
          social_links: Json | null
          sort_order: number | null
          updated_at: string
          years_experience: string | null
        }
        Insert: {
          badge_urls?: Json | null
          badges_achieved?: string[] | null
          bio: string
          brand_name?: string | null
          created_at?: string
          email: string
          expertise?: string[] | null
          id?: string
          image?: string | null
          is_visible?: boolean
          key_achievements?: string[] | null
          lives_impacted?: number | null
          location?: string | null
          membership_level?: string | null
          name: string
          phone?: string | null
          role: string
          social_links?: Json | null
          sort_order?: number | null
          updated_at?: string
          years_experience?: string | null
        }
        Update: {
          badge_urls?: Json | null
          badges_achieved?: string[] | null
          bio?: string
          brand_name?: string | null
          created_at?: string
          email?: string
          expertise?: string[] | null
          id?: string
          image?: string | null
          is_visible?: boolean
          key_achievements?: string[] | null
          lives_impacted?: number | null
          location?: string | null
          membership_level?: string | null
          name?: string
          phone?: string | null
          role?: string
          social_links?: Json | null
          sort_order?: number | null
          updated_at?: string
          years_experience?: string | null
        }
        Relationships: []
      }
      leaderboard_data: {
        Row: {
          badges: string[] | null
          calls_attended: number | null
          created_at: string
          id: string
          last_activity: string | null
          member_name: string
          points: number
          rank_position: number | null
          updated_at: string
        }
        Insert: {
          badges?: string[] | null
          calls_attended?: number | null
          created_at?: string
          id?: string
          last_activity?: string | null
          member_name: string
          points?: number
          rank_position?: number | null
          updated_at?: string
        }
        Update: {
          badges?: string[] | null
          calls_attended?: number | null
          created_at?: string
          id?: string
          last_activity?: string | null
          member_name?: string
          points?: number
          rank_position?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          available_quantity: number | null
          benefits: string[] | null
          category: string
          created_at: string
          description: string
          detailed_description: string | null
          featured: boolean | null
          id: string
          image: string
          in_stock: boolean | null
          name: string
          original_price: string | null
          price: string
          product_id: string
          rating: number | null
          sku: string
          specifications: Json | null
          updated_at: string
        }
        Insert: {
          available_quantity?: number | null
          benefits?: string[] | null
          category: string
          created_at?: string
          description: string
          detailed_description?: string | null
          featured?: boolean | null
          id?: string
          image: string
          in_stock?: boolean | null
          name: string
          original_price?: string | null
          price: string
          product_id: string
          rating?: number | null
          sku: string
          specifications?: Json | null
          updated_at?: string
        }
        Update: {
          available_quantity?: number | null
          benefits?: string[] | null
          category?: string
          created_at?: string
          description?: string
          detailed_description?: string | null
          featured?: boolean | null
          id?: string
          image?: string
          in_stock?: boolean | null
          name?: string
          original_price?: string | null
          price?: string
          product_id?: string
          rating?: number | null
          sku?: string
          specifications?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: Database["public"]["Enums"]["resource_category"]
          created_at: string
          description: string
          file_size: string | null
          id: string
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          category: Database["public"]["Enums"]["resource_category"]
          created_at?: string
          description: string
          file_size?: string | null
          id?: string
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          category?: Database["public"]["Enums"]["resource_category"]
          created_at?: string
          description?: string
          file_size?: string | null
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: []
      }
      section_toggles: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          section_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          section_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string | null
          is_main_admin: boolean
          role_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          is_main_admin?: boolean
          role_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          is_main_admin?: boolean
          role_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          role_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          role_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          role_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      resource_category: "guides" | "videos" | "tools"
      resource_type: "PDF" | "Video" | "Tool" | "Link"
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
      app_role: ["admin", "moderator", "user"],
      resource_category: ["guides", "videos", "tools"],
      resource_type: ["PDF", "Video", "Tool", "Link"],
    },
  },
} as const
