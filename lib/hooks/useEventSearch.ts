import { useState, useRef, useCallback } from "react";
import { Location, LocationWithEvents } from "../types/location";
import { MapBounds } from "./useLocationSearch";
import { FiltersType } from "@/components/common/LeftHandFilters/LeftHandFilters";
import { parseFilters } from "../helpers/filters";
import api from "../utils/request";

export const useEventSearch = () => {
  const [nearbyEvents, setNearbyEvents] = useState<LocationWithEvents[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchEventsInBounds = useCallback(
    async (bounds: MapBounds, filters?: FiltersType) => {
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

        const paramsWithFilters = parseFilters(filters, params);

        const { data } = await api.get(
          `/api/events/bounds?${paramsWithFilters}`,
          {
            signal: abortControllerRef.current.signal,
          }
        );
        setNearbyEvents(data || []);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching locations:", error);
          setError("Failed to load locations");
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    nearbyEvents,
    loading,
    error,
    fetchEventsInBounds,
  };
};
