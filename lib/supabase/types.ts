export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cars: {
        Row: {
          created_at: string
          description: string | null
          id: string
          make: string
          model: string
          power: number | null
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          make: string
          model: string
          power?: number | null
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          make?: string
          model?: string
          power?: number | null
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          id: string
          level: string
          location_id: string | null
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          max_participants: number
          price: number
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          id?: string
          level: string
          location_id?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          max_participants: number
          price: number
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          id?: string
          level?: string
          location_id?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          max_participants?: number
          price?: number
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          lat: number
          lng: number
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          car_id: string
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          car_id: string
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          car_id?: string
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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

export type Car = Database['public']['Tables']['cars']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Registration = Database['public']['Tables']['registrations']['Row']
export type User = Database['public']['Tables']['users']['Row']

export interface EventWithCreator extends Event {
  creator: Pick<User, 'id' | 'display_name' | 'email'>
  location?: Location
}

export interface EventWithRegistrations extends Event {
  creator: Pick<User, 'id' | 'display_name' | 'email'>
  location?: Location
  registrations: Array<{
    id: string
    user: Pick<User, 'id' | 'display_name' | 'email'>
    car: Pick<Car, 'id' | 'make' | 'model' | 'year'>
  }>
}

export interface FullRegistration extends Registration {
  event: Event & { location?: Location }
  car: Car
}
