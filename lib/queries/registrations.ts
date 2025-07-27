import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { FullRegistration, Registration } from "@/lib/supabase/types";
import { TFilters } from "../types";

export function useRegistrations(filters: TFilters, userId?: string) {
  return useQuery({
    queryKey: ["registrations", filters, userId],
    queryFn: async () => {
      // const { data, error } = await supabase
      //   .from("registrations")
      //   .select(
      //     `
      //     *,
      //     event:events(*),
      //     car:cars(*)
      //   `
      //   )
      //   .eq("user_id", userId!)
      // .order("created_at", { ascending: false });

      const today = new Date(); // YYYY-MM-DD

      const { data, error } = await supabase
        .from("registrations")
        .select(
          `
            *,
            event:events(
              id, 
              title,
              slug,
              level,
              price,
              event_date,
              location:locations(id, name, latitude, longitude)
            ),
            car:cars(id, make, model, year)
          `
        )
        .eq("user_id", userId)
        .is("deleted_at", null)
        .gte("event.event_date", today ?? 0)
        .eq("event.deleted_at", null)
        .eq("event.level", filters.level)
        .lte("event.price", filters.priceMax)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FullRegistration[];
    },
    enabled: !!userId,
  });
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      registrationData: Omit<Registration, "id" | "created_at" | "deleted_at">
    ) => {
      const { data, error } = await supabase
        .from("registrations")
        .insert(registrationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: Registration, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["registrations", variables.user_id],
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", data.event_id] });
    },
  });
}

export function useDeleteRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
