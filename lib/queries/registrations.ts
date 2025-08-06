import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useRegistrations(filters?: {
  level?: string
  priceMax?: number
}) {
  return useQuery({
    queryKey: ['registrations', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.level) params.append('level', filters.level)
      if (filters?.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString())

      const response = await fetch(`/api/registrations?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch registrations')
      }
      
      const data = await response.json()
      return data.registrations
    },
  })
}

export function useCreateRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (registrationData: { event_id: string; car_id: string }) => {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      if (!response.ok) {
        throw new Error('Failed to create registration')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
