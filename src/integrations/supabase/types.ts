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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      consultations: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          note: string | null
          patient_id: string
          status: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          note?: string | null
          patient_id: string
          status?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          note?: string | null
          patient_id?: string
          status?: string
        }
        Relationships: []
      }
      doctor_profiles: {
        Row: {
          answers: Json
          avatar_color: string
          bio: string | null
          clinic_address: string | null
          core_fields: string[]
          created_at: string
          experience_years: number
          fee: number | null
          full_name: string
          languages: string[]
          qualifications: string | null
          specialty: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          avatar_color?: string
          bio?: string | null
          clinic_address?: string | null
          core_fields?: string[]
          created_at?: string
          experience_years?: number
          fee?: number | null
          full_name: string
          languages?: string[]
          qualifications?: string | null
          specialty: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          avatar_color?: string
          bio?: string | null
          clinic_address?: string | null
          core_fields?: string[]
          created_at?: string
          experience_years?: number
          fee?: number | null
          full_name?: string
          languages?: string[]
          qualifications?: string | null
          specialty?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          color: string | null
          created_at: string
          dosage: string | null
          expires_on: string | null
          id: string
          instructions: string | null
          is_active: boolean
          name: string
          patient_id: string | null
          prescribed_by: string | null
          prescription_image_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          dosage?: string | null
          expires_on?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          name: string
          patient_id?: string | null
          prescribed_by?: string | null
          prescription_image_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          dosage?: string | null
          expires_on?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          name?: string
          patient_id?: string | null
          prescribed_by?: string | null
          prescription_image_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          address: string | null
          age: number | null
          allergies: string | null
          answers: Json
          condition: string | null
          created_at: string
          emergency_category: string | null
          emergency_needed: boolean
          full_name: string
          gender: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          allergies?: string | null
          answers?: Json
          condition?: string | null
          created_at?: string
          emergency_category?: string | null
          emergency_needed?: boolean
          full_name: string
          gender?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          age?: number | null
          allergies?: string | null
          answers?: Json
          condition?: string | null
          created_at?: string
          emergency_category?: string | null
          emergency_needed?: boolean
          full_name?: string
          gender?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string | null
          avatar_url: string | null
          conditions: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          avatar_url?: string | null
          conditions?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          avatar_url?: string | null
          conditions?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      reminder_logs: {
        Row: {
          done_at: string
          done_on: string
          id: string
          reminder_id: string
          user_id: string
        }
        Insert: {
          done_at?: string
          done_on?: string
          id?: string
          reminder_id: string
          user_id: string
        }
        Update: {
          done_at?: string
          done_on?: string
          id?: string
          reminder_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string
          date_of_event: string | null
          detail: string | null
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["reminder_kind"]
          medicine_id: string | null
          patient_id: string | null
          prescribed_by: string | null
          repeat: Database["public"]["Enums"]["reminder_repeat"]
          time_of_day: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_event?: string | null
          detail?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["reminder_kind"]
          medicine_id?: string | null
          patient_id?: string | null
          prescribed_by?: string | null
          repeat?: Database["public"]["Enums"]["reminder_repeat"]
          time_of_day?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_event?: string | null
          detail?: string | null
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["reminder_kind"]
          medicine_id?: string | null
          patient_id?: string | null
          prescribed_by?: string | null
          repeat?: Database["public"]["Enums"]["reminder_repeat"]
          time_of_day?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "doctor"
      reminder_kind:
        | "medication"
        | "water"
        | "movement"
        | "rest"
        | "nourish"
        | "checkin"
        | "appointment"
      reminder_repeat: "none" | "daily" | "weekdays" | "weekly"
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
      app_role: ["patient", "doctor"],
      reminder_kind: [
        "medication",
        "water",
        "movement",
        "rest",
        "nourish",
        "checkin",
        "appointment",
      ],
      reminder_repeat: ["none", "daily", "weekdays", "weekly"],
    },
  },
} as const
