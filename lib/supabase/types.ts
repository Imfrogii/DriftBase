export type Database = {
  public: {
    Tables: {
      cars: {
        Row: {
          created_at: string;
          description: string | null;
          level: CarLevel;
          id: string;
          name?: string;
          model: string;
          power: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          description?: string | null;
          name?: string;
          model: string;
          level: CarLevel;
          power: number;
          user_id: string;
        };
        Update: {
          description?: string | null;
          name?: string;
          model?: string;
          power?: number | null;
          level?: CarLevel;
        };
        Relationships: [
          {
            foreignKeyName: "cars_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          created_at: string;
          created_by: string;
          description: string;
          description_short: string;
          start_date: string;
          end_date: string;
          id: string;
          level: EventLevel;
          location_id: string;
          max_drivers: number;
          type: EventType;
          image_url: string | null;
          geom: string;
          free_places: number;
          registered_drivers: number;
          price: number;
          payment_type: PaymentType;
          slug: string;
          status: EventStatus;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_by: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          level: EventLevel;
          type: EventType;
          image_url?: string | null;
          location_id: string;
          max_drivers: number;
          price: number;
          slug: string;
          payment_type: PaymentType;
          title: string;
        };
        Update: {
          description?: string | null;
          start_date?: string;
          end_date?: string;
          level?: EventLevel;
          location_id?: string | null;
          type?: EventType;
          image_url?: string | null;
          max_drivers?: number;
          price?: number;
          slug?: string;
          payment_type?: PaymentType;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          }
        ];
      };
      locations: {
        Row: {
          address: string;
          created_at: string;
          id: string;
          geom: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          address: string;
          geom: string;
          name: string;
        };
        Update: {
          address?: string;
          geom?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      registrations: {
        Row: {
          car_id: string;
          created_at: string;
          updated_at: string;
          event_id: string;
          id: string;
          user_id: string;
          status: RegistrationStatus;
          payment_type: PaymentType;
          stripe_session_id: string | null;
          payment_intent_id: string | null;
          cancelled_text: string | null;
          attended: boolean;
        };
        Insert: {
          car_id: string;
          event_id: string;
          user_id: string;
          status?: RegistrationStatus;
          payment_type: PaymentType;
          stripe_session_id?: string | null;
        };
        Update: {
          status?: RegistrationStatus;
          cancelled_text?: string | null;
          payment_intent_id?: string;
          attended?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "registrations_car_id_fkey";
            columns: ["car_id"];
            isOneToOne: false;
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registrations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registrations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      registration_codes: {
        Row: {
          id: string;
          registration_id: string;
          code: number;
          expires_at: string;
        };
        Insert: {
          registration_id: string;
          code: number;
          expires_at: string;
        };
        Update: {};
        Relationships: [
          {
            foreignKeyName: "registration_codes_registration_id_fkey";
            columns: ["registration_id"];
            isOneToOne: false;
            referencedRelation: "registrations";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          created_at: string;
          display_name: string | null;
          instagram: string | null;
          email: string;
          org_name: string | null;
          id: string;
          role: string;
          stripe_account_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          instagram?: string | null;
          org_name?: string | null;
          email: string;
          stripe_account_id?: string | null;
          id: string;
          role?: string;
        };
        Update: {
          display_name?: string | null;
          instagram?: string | null;
          org_name?: string | null;
          email?: string;
          stripe_account_id?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Car = Database["public"]["Tables"]["cars"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type Registration = Database["public"]["Tables"]["registrations"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];

export interface EventWithCreator extends Event {
  creator: Pick<User, "display_name">;
  location: Location;
}

export interface EventWithRegistrations extends Event {
  creator: Pick<User, "display_name">;
  location: Location;
  registrations: Array<{
    id: string;
    user: Pick<User, "id" | "display_name" | "email">;
    car: Pick<Car, "id" | "name" | "model" | "level">;
  }>;
}

export interface FullRegistration extends Registration {
  event: Event & { location?: Location };
  car: Car;
}

export enum EventType {
  COMPETITION = "competition",
  EVENT = "event",
  TRAINING = "training",
}

export enum EventLevel {
  STREET = "street",
  SEMI_PRO = "semi_pro",
  PRO = "pro",
}

export enum EventStatus {
  PENDING = "pending",
  ACTIVE = "active",
  CANCELLED = "cancelled",
  DELETED = "deleted",
}

export enum RegistrationStatus {
  // Cash payments
  PENDING = "pending",
  ACTIVE = "active",
  CANCELLED = "cancelled",

  // Online payments
  PAYMENT_INITIATED = "payment_initiated", // Payment process started
  PAID = "paid", // Payment successful
  PAYMENT_FAILED = "payment_failed", // e.g., card declined

  REFUND_INITIATED = "refund_initiated", // Refund process started
  REFUNDED = "refunded", // Refund issued by user
  REFUND_FAILED = "refund_failed", // Refund process failed

  PAYMENT_INVESTIGATE = "payment_investigate", // Requires manual investigation
  EXPIRED_REFUNDED = "expired_refunded", // No payment within time limit or webhook missed - auto-refunded
  EXPIRED_NO_PAYMENT = "expired_no_payment", // No payment within time limit or webhook missed - no payment made
  CANCELLED_NO_REFUND = "cancelled_no_refund", // Late cancellation - no refund given
}

export enum PaymentType {
  CASH = "cash",
  ONLINE = "online",
}

export enum CarLevel {
  STREET = "street",
  SEMI_PRO = "semi_pro",
  PRO = "pro",
}
