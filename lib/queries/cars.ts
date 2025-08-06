import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useCars() {
  return useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const response = await fetch('/api/cars')
      if (!response.ok) {
        throw new Error('Failed to fetch cars')
      }
      
      const data = await response.json()
      return data.cars
    },
  })
}

export function useCreateCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (carData: {
      make: string
      model: string
      year: number
      power?: number
      description?: string
    }) => {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      })

      if (!response.ok) {
        throw new Error('Failed to create car')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })
}

export function useUpdateCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...carData }: {
      id: string
      make: string
      model: string
      year: number
      power?: number
      description?: string
    }) => {
      const response = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      })

      if (!response.ok) {
        throw new Error('Failed to update car')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })
}

export function useDeleteCar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cars/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete car')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] })
    },
  })
}
