export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: "user" | "admin";
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          role?: "user" | "admin";
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "user" | "admin";
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cars: {
        Row: {
          id: string;
          user_id: string;
          make: string;
          model: string;
          year: number;
          power: number | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          make: string;
          model: string;
          year: number;
          power?: number | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          make?: string;
          model?: string;
          year?: number;
          power?: number | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          description: string | null;
          event_date: string;
          level: "beginner" | "street" | "pro";
          location_id: string;
          price: number;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          updated_at: string;
          max_drivers: number | null;
          registered_drivers: number | null;
          slug: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_by: string;
          title: string;
          description?: string | null;
          event_date: string;
          level: "beginner" | "street" | "pro";
          location_id: string;
          price?: number;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
          slug: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          level?: "beginner" | "street" | "pro";
          location_id: string;
          price?: number;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
          slug: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          latitude: number;
          longitude: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          latitude: number;
          longitude: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          latitude?: number;
          longitude?: number;
          created_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          car_id: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          car_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          car_id?: string;
          created_at?: string;
        };
      };
    };
  };
};

export type User = Database["public"]["Tables"]["users"]["Row"];
export type Car = Database["public"]["Tables"]["cars"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type Registration = Database["public"]["Tables"]["registrations"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];

export type EventWithCreator = Event & {
  creator: Pick<User, "id" | "display_name" | "email">;
  location: Pick<Location, "id" | "name" | "latitude" | "longitude">;
};

export type EventWithLocation = Event & {
  location: Pick<Location, "id" | "name" | "latitude" | "longitude">;
};

export type EventWithRegistrations = Event & {
  registrations: (Registration & {
    user: Pick<User, "id" | "display_name" | "email">;
    car: Pick<Car, "id" | "make" | "model" | "year">;
  })[];
};

export type FullEventData = Event & {
  creator: Pick<User, "id" | "display_name" | "email">;
  registrations: (Registration & {
    user: Pick<User, "id" | "display_name" | "email">;
    car: Pick<Car, "id" | "make" | "model" | "year">;
  })[];
  location: Pick<Location, "id" | "name" | "latitude" | "longitude">;
};

export type FullRegistration = Registration & {
  event: Pick<
    Event,
    "id" | "title" | "slug" | "level" | "price" | "event_date"
  >;
  car: Pick<Car, "id" | "make" | "model" | "year">;
};
