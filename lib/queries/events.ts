import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import type { Event, EventWithCreator, EventWithRegistrations } from "@/lib/supabase/types"

export function useEvents(filters?: {
  level?: string
  priceMin?: number
  priceMax?: number
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          creator:users!events_created_by_fkey(id, display_name, email)
        `)
        .eq("status", "approved")
        .order("event_date", { ascending: true })

      if (filters?.level) {
        query = query.eq("level", filters.level)
      }

      if (filters?.priceMin !== undefined) {
        query = query.gte("price", filters.priceMin)
      }

      if (filters?.priceMax !== undefined) {
        query = query.lte("price", filters.priceMax)
      }

      if (filters?.dateFrom) {
        query = query.gte("event_date", filters.dateFrom)
      }

      if (filters?.dateTo) {
        query = query.lte("event_date", filters.dateTo)
      }

      const { data, error } = await query

      if (error) throw error
      return data as EventWithCreator[]
    },
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          creator:users!events_created_by_fkey(id, display_name, email),
          registrations(
            *,
            user:users(id, display_name, email),
            car:cars(id, make, model, year)
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data as EventWithRegistrations
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: Omit<Event, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("events").insert(eventData).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { data, error } = await supabase.from("events").update({ status }).eq("id", id).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      queryClient.invalidateQueries({ queryKey: ["admin-events"] })
    },
  })
}
