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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          image_key: string
          name: string
          short_name: string
          sort_order: number
          visible: boolean
        }
        Insert: {
          id: string
          image_key?: string
          name: string
          short_name: string
          sort_order?: number
          visible?: boolean
        }
        Update: {
          id?: string
          image_key?: string
          name?: string
          short_name?: string
          sort_order?: number
          visible?: boolean
        }
        Relationships: []
      }
      order_history: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          note: string
          order_id: string
          status: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string
          order_id: string
          status: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          created_at: string
          customer_name: string
          delivery_fee: number
          email: string
          fulfillment: string
          id: string
          items: Json
          payment_method: string
          payment_status: string
          phone: string
          provider: string | null
          reference: string
          status: string
          subtotal: number
          total: number
          transaction_reference: string | null
          user_id: string | null
          zone: string
        }
        Insert: {
          address?: string
          created_at?: string
          customer_name: string
          delivery_fee: number
          email: string
          fulfillment: string
          id?: string
          items: Json
          payment_method: string
          payment_status?: string
          phone: string
          provider?: string | null
          reference?: string
          status?: string
          subtotal: number
          total: number
          transaction_reference?: string | null
          user_id?: string | null
          zone: string
        }
        Update: {
          address?: string
          created_at?: string
          customer_name?: string
          delivery_fee?: number
          email?: string
          fulfillment?: string
          id?: string
          items?: Json
          payment_method?: string
          payment_status?: string
          phone?: string
          provider?: string | null
          reference?: string
          status?: string
          subtotal?: number
          total?: number
          transaction_reference?: string | null
          user_id?: string | null
          zone?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string
          category: string
          description: string
          gallery: string[]
          id: string
          image_key: string
          name: string
          original_price: number | null
          price: number
          specs: Json
          stock: number
          verified: boolean
        }
        Insert: {
          brand: string
          category: string
          description?: string
          gallery?: string[]
          id: string
          image_key: string
          name: string
          original_price?: number | null
          price: number
          specs?: Json
          stock?: number
          verified?: boolean
        }
        Update: {
          brand?: string
          category?: string
          description?: string
          gallery?: string[]
          id?: string
          image_key?: string
          name?: string
          original_price?: number | null
          price?: number
          specs?: Json
          stock?: number
          verified?: boolean
        }
        Relationships: []
      }
      saved_addresses: {
        Row: {
          address: string
          id: string
          name: string
          phone: string
          user_id: string
        }
        Insert: {
          address: string
          id?: string
          name: string
          phone: string
          user_id: string
        }
        Update: {
          address?: string
          id?: string
          name?: string
          phone?: string
          user_id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          address: string
          announcement: string
          central_fee: number
          email: string
          featured_ids: string[]
          free_threshold: number
          greater_fee: number
          hero_image: string
          hero_subtitle: string
          hero_title: string
          hours: string
          id: number
          momo_name: string
          momo_number: string
          nationwide_fee: number
          ordering_enabled: boolean
          phone: string
          setup_image: string
          whatsapp: string
        }
        Insert: {
          address?: string
          announcement?: string
          central_fee?: number
          email?: string
          featured_ids?: string[]
          free_threshold?: number
          greater_fee?: number
          hero_image?: string
          hero_subtitle?: string
          hero_title?: string
          hours?: string
          id?: number
          momo_name?: string
          momo_number?: string
          nationwide_fee?: number
          ordering_enabled?: boolean
          phone?: string
          setup_image?: string
          whatsapp?: string
        }
        Update: {
          address?: string
          announcement?: string
          central_fee?: number
          email?: string
          featured_ids?: string[]
          free_threshold?: number
          greater_fee?: number
          hero_image?: string
          hero_subtitle?: string
          hero_title?: string
          hours?: string
          id?: number
          momo_name?: string
          momo_number?: string
          nationwide_fee?: number
          ordering_enabled?: boolean
          phone?: string
          setup_image?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_staff: { Args: never; Returns: boolean }
      place_store_order: { Args: { payload: Json }; Returns: Json }
      staff_update_order: {
        Args: { new_payment: string; new_status: string; order_uuid: string }
        Returns: undefined
      }
      track_store_order: {
        Args: { customer_phone: string; ref: string }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
