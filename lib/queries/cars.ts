import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import type { Car } from "@/lib/supabase/types"

export function useCars(userId?: string) {
  return useQuery({
    queryKey: ["cars", userId],
    queryFn: async () => {
      let query = supabase.from("cars").select("*").order("created_at", { ascending: false })

      if (userId) {
        query = query.eq("user_id", userId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Car[]
    },
    enabled: !!userId,
  })
}

export function useCreateCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (carData: Omit<Car, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("cars").insert(carData).select().single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cars", variables.user_id] })
    },
  })
}

export function useUpdateCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...carData }: Partial<Car> & { id: string }) => {
      const { data, error } = await supabase.from("cars").update(carData).eq("id", id).select().single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cars", data.user_id] })
    },
  })
}

export function useDeleteCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cars").delete().eq("id", id)

      if (error) throw error
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["cars"] })
    },
  })
}
