import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import type { Registration } from "@/lib/supabase/types"

export function useRegistrations(userId?: string) {
  return useQuery({
    queryKey: ["registrations", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          *,
          event:events(*),
          car:cars(*)
        `)
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useCreateRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (registrationData: Omit<Registration, "id" | "created_at">) => {
      const { data, error } = await supabase.from("registrations").insert(registrationData).select().single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["registrations", data.user_id] })
      queryClient.invalidateQueries({ queryKey: ["event", data.event_id] })
    },
  })
}

export function useDeleteRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("registrations").delete().eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] })
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}
