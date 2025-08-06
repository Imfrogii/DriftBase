import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useEvents(filters?: {
  level?: string
  priceMin?: number
  priceMax?: number
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.level) params.append('level', filters.level)
      if (filters?.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString())
      if (filters?.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString())
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/events?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      
      const data = await response.json()
      return data.events
    },
  })
}

export function useMyEvents(filters?: {
  level?: string
  priceMin?: number
  priceMax?: number
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: ['my-events', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters?.level) params.append('level', filters.level)
      if (filters?.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString())
      if (filters?.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString())
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/events/my-events?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch my events')
      }
      
      const data = await response.json()
      return data.events
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: any) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['my-events'] })
    },
  })
}
