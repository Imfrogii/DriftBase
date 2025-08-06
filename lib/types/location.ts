export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  created_at: string
}

export interface LocationSearchParams {
  q?: string
  lat?: number
  lng?: number
  radius?: number
  page?: number
  limit?: number
}

export interface LocationSearchResponse {
  locations: Location[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
