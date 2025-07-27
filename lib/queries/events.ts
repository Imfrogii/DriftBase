import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  Event,
  EventWithCreator,
  EventWithLocation,
  EventWithRegistrations,
  FullEventData,
} from "@/lib/supabase/types";

export function useEvents(filters?: {
  level?: string;
  priceMin?: number;
  priceMax?: number;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      let query = supabase
        // .from("events")
        // .select(
        //   `
        //   *,
        //   creator:users!events_created_by_fkey(id, display_name, email)
        // `
        // )
        // // .eq("status", "approved")
        // .order("event_date", { ascending: true });
        .from("events")
        .select("*, location:locations(*)")
        .is("deleted_at", null)
        .order("event_date", { ascending: true });

      if (filters?.level) {
        query = query.eq("level", filters.level);
      }

      if (filters?.priceMin !== undefined) {
        query = query.gte("price", filters.priceMin);
      }

      if (filters?.priceMax !== undefined) {
        query = query.lte("price", filters.priceMax);
      }

      if (filters?.dateFrom) {
        query = query.gte("event_date", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("event_date", filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EventWithCreator[];
    },
  });
}

export function useMyEvents(
  filters?: {
    level?: string;
    priceMin?: number;
    priceMax?: number;
    dateFrom?: string;
    dateTo?: string;
  },
  userId?: string
) {
  return useQuery({
    queryKey: ["my-events", filters, userId],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*, location:locations(*),")
        .is("deleted_at", null)
        .eq("created_by", userId)
        .order("event_date", { ascending: true });

      if (filters?.level) {
        query = query.eq("level", filters.level);
      }

      if (filters?.priceMax !== undefined) {
        query = query.lte("price", filters.priceMax);
      }

      if (filters?.dateFrom) {
        query = query.gte("event_date", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("event_date", filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EventWithLocation[];
    },
  });
}

export function useEvent(eventSlug: string) {
  const { data: id, isLoading: isLoadingId } = useQuery({
    queryKey: ["event-id", eventSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id")
        .eq("slug", eventSlug)
        .single();

      if (error) throw error;
      return data.id as string;
    },
  });

  const { data, isLoading } = useQuery({
    enabled: !!id,
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          creator:users!events_created_by_fkey(id, display_name, email),
          registrations(
            *,
            user:users(id, display_name, email),
            car:cars(id, make, model, year)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as FullEventData;
    },
  });

  return { data, isLoading: isLoading || isLoadingId };
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      eventData: Omit<
        Event,
        "id" | "created_at" | "updated_at" | "registered_drivers" | "deleted_at"
      >
    ) => {
      const { data, error } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      event_id,
      eventData,
    }: {
      event_id: string;
      eventData: Omit<
        Event,
        "created_at" | "updated_at" | "registered_drivers" | "deleted_at"
      >;
    }) => {
      const { data, error } = await supabase
        .from("events")
        .update(eventData)
        .eq("slug", event_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["event", vars.event_id],
      });
    },
  });
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      event_id,
      status,
    }: {
      event_id: string;
      status: "approved" | "rejected";
    }) => {
      const { data, error } = await supabase
        .from("events")
        .update({ status })
        .eq("slug", event_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["event", vars.event_id],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}
