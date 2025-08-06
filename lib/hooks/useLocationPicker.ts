"use client"

import { useState, useEffect, useCallback } from "react"
import type L from "leaflet"

interface MapBounds {
  center: { lat: number; lng: number }
  bounds: L.LatLngBounds
  zoom: number
}

interface UseLocationPickerProps {
  initialLocation?: {
    name?: string
    latitude: number
    longitude: number
  }
  onLocationSelect: (location: { name: string; latitude: number; longitude: number }) => void
}

export function useLocationPicker({ initialLocation, onLocationSelect }: UseLocationPickerProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.2297, 21.0122])
  const [mapZoom, setMapZoom] = useState(10)
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null)
  const [selectedLocationName, setSelectedLocationName] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize map center only once
  useEffect(() => {
    if (isInitialized) return

    if (initialLocation) {
      setMapCenter([initialLocation.latitude, initialLocation.longitude])
      setSelectedPosition([initialLocation.latitude, initialLocation.longitude])
      setSelectedLocationName(initialLocation.name || "")
      setMapZoom(15)
      setIsInitialized(true)
    } else {
      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setMapCenter([latitude, longitude])
            setMapZoom(12)
            setIsInitialized(true)
          },
          () => {
            setIsInitialized(true)
          },
        )
      } else {
        setIsInitialized(true)
      }
    }
  }, [initialLocation, isInitialized])

  const selectLocation = useCallback(
    (location: { name: string; latitude: number; longitude: number }) => {
      setMapCenter([location.latitude, location.longitude])
      setSelectedPosition([location.latitude, location.longitude])
      setSelectedLocationName(location.name)
      onLocationSelect(location)
    },
    [onLocationSelect],
  )

  const updateSelectedPosition = useCallback(
    (position: [number, number], name?: string) => {
      setSelectedPosition(position)
      const locationName = name || selectedLocationName || "Custom Location"
      setSelectedLocationName(locationName)
      onLocationSelect({
        name: locationName,
        latitude: position[0],
        longitude: position[1],
      })
    },
    [selectedLocationName, onLocationSelect],
  )

  const getCurrentLocation = useCallback(() => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setMapCenter([latitude, longitude])
          setMapZoom(15)
          resolve({ latitude, longitude })
        },
        () => {
          reject(new Error("Failed to get current location"))
        },
      )
    })
  }, [])

  return {
    mapCenter,
    mapZoom,
    selectedPosition,
    selectedLocationName,
    isInitialized,
    setMapCenter,
    setMapZoom,
    selectLocation,
    updateSelectedPosition,
    getCurrentLocation,
  }
}
