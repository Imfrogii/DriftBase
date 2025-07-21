export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: "user" | "admin"
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: "user" | "admin"
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: "user" | "admin"
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cars: {
        Row: {
          id: string
          user_id: string
          make: string
          model: string
          year: number
          power: number | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          make: string
          model: string
          year: number
          power?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          make?: string
          model?: string
          year?: number
          power?: number | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          created_by: string
          title: string
          description: string | null
          location_lat: number
          location_lng: number
          location_name: string | null
          event_date: string
          level: "beginner" | "street" | "pro"
          price: number
          status: "pending" | "approved" | "rejected"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by: string
          title: string
          description?: string | null
          location_lat: number
          location_lng: number
          location_name?: string | null
          event_date: string
          level: "beginner" | "street" | "pro"
          price?: number
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string
          title?: string
          description?: string | null
          location_lat?: number
          location_lng?: number
          location_name?: string | null
          event_date?: string
          level?: "beginner" | "street" | "pro"
          price?: number
          status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          user_id: string
          event_id: string
          car_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          car_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          car_id?: string
          created_at?: string
        }
      }
    }
  }
}

export type User = Database["public"]["Tables"]["users"]["Row"]
export type Car = Database["public"]["Tables"]["cars"]["Row"]
export type Event = Database["public"]["Tables"]["events"]["Row"]
export type Registration = Database["public"]["Tables"]["registrations"]["Row"]

export type EventWithCreator = Event & {
  creator: Pick<User, "id" | "display_name" | "email">
}

export type EventWithRegistrations = Event & {
  registrations: (Registration & {
    user: Pick<User, "id" | "display_name" | "email">
    car: Pick<Car, "id" | "make" | "model" | "year">
  })[]
}
