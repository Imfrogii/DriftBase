"use client"

import { useState, useCallback, useRef } from "react"
import type { Location } from "@/lib/types/location"
import type L from "leaflet"

interface MapBounds {
  center: { lat: number; lng: number }
  bounds: L.LatLngBounds
  zoom: number
}

export function useLocationSearch() {
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query,
        limit: "10",
      })

      const response = await fetch(`/api/locations/search?${params}`)
      if (!response.ok) throw new Error("Failed to search locations")

      const data = await response.json()
      setSearchResults(data.locations || [])
    } catch (error) {
      console.error("Error searching locations:", error)
      setError("Failed to search locations")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLocationsInBounds = useCallback(async (bounds: MapBounds) => {
    if (bounds.zoom < 5) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        north: bounds.bounds.getNorth().toString(),
        south: bounds.bounds.getSouth().toString(),
        east: bounds.bounds.getEast().toString(),
        west: bounds.bounds.getWest().toString(),
        limit: "100",
      })

      const response = await fetch(`/api/locations/bounds?${params}`, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) throw new Error("Failed to fetch locations")

      const data = await response.json()
      setNearbyLocations(data.locations || [])
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching locations:", error)
        setError("Failed to load locations")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const createLocation = useCallback(async (name: string, latitude: number, longitude: number) => {
    try {
      const response = await fetch("/api/locations/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, latitude, longitude }),
      })

      if (!response.ok) throw new Error("Failed to create location")

      const data = await response.json()
      return data.location
    } catch (error) {
      console.error("Error creating location:", error)
      throw new Error("Failed to create location")
    }
  }, [])

  const clearSearchResults = useCallback(() => {
    setSearchResults([])
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    searchResults,
    nearbyLocations,
    loading,
    error,
    searchLocations,
    fetchLocationsInBounds,
    createLocation,
    clearSearchResults,
    clearError,
    cleanup,
  }
}
