"use client";

import { useState, useCallback, useRef } from "react";
import type { Location } from "@/lib/types/location";
import { LngLatBounds } from "react-map-gl/dist/esm/types";
import api from "../utils/request";

export interface MapBounds {
  center: { lat: number; lng: number };
  bounds: LngLatBounds;
  zoom: number;
}

export function useLocationSearch() {
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        limit: "10",
      });

      const { data } = await api.get(`/api/locations/search?${params}`);
      setSearchResults(data.locations || []);
    } catch (error) {
      console.error("Error searching locations:", error);
      setError("Failed to search locations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLocationsInBounds = useCallback(async (bounds: MapBounds) => {
    if (bounds.zoom < 5) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        north: bounds.bounds.getNorth().toString(),
        south: bounds.bounds.getSouth().toString(),
        east: bounds.bounds.getEast().toString(),
        west: bounds.bounds.getWest().toString(),
      });

      const { data } = await api.get(`/api/locations/bounds?${params}`, {
        signal: abortControllerRef.current.signal,
      });

      setNearbyLocations(data?.locations || []);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching locations:", error);
        setError("Failed to load locations");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createLocation = useCallback(
    async ({
      name,
      address,
      latitude,
      longitude,
    }: {
      name: string;
      address: string;
      latitude: number;
      longitude: number;
    }) => {
      try {
        const { data } = await api.post(`/api/locations`, {
          name,
          latitude,
          longitude,
          address,
        });

        return data.location;
      } catch (error) {
        throw new Error("Failed to create location");
      }
    },
    []
  );

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

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
  };
}
