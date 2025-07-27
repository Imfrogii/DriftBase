"use client";

import { useState, useCallback } from "react";
import type L from "leaflet";

interface MapBounds {
  center: { lat: number; lng: number };
  bounds: L.LatLngBounds;
  zoom: number;
}

export function useMapInteraction() {
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [lastQueriedBounds, setLastQueriedBounds] = useState<MapBounds | null>(
    null
  );
  const [ghostPosition, setGhostPosition] = useState<[number, number] | null>(
    null
  );
  const [showSearchButton, setShowSearchButton] = useState(false);

  // Calculate if map has moved significantly
  const hasMovedSignificantly = useCallback(
    (current: MapBounds, last: MapBounds | null): boolean => {
      if (!last) return true;
      if (current.zoom !== last.zoom) return true;

      // Calculate viewport size in degrees
      const viewportWidth = current.bounds.getEast() - current.bounds.getWest();
      const viewportHeight =
        current.bounds.getNorth() - current.bounds.getSouth();

      // Calculate center movement as percentage of viewport
      const centerLatDiff = Math.abs(current.center.lat - last.center.lat);
      const centerLngDiff = Math.abs(current.center.lng - last.center.lng);

      const latPercentage = centerLatDiff / viewportHeight;
      const lngPercentage = centerLngDiff / viewportWidth;
      console.log(latPercentage, lngPercentage);

      // Consider significant if moved more than 30% of viewport
      return latPercentage > 0.3 || lngPercentage > 0.3;
    },
    []
  );

  const handleMapChange = useCallback(
    (bounds: MapBounds) => {
      setCurrentBounds(bounds);

      console.log(bounds.zoom);
      // Check if we should show the search button
      if (
        bounds.zoom >= 5 &&
        hasMovedSignificantly(bounds, lastQueriedBounds)
      ) {
        setShowSearchButton(true);
      } else if (bounds.zoom < 5) {
        setShowSearchButton(false);
      }
    },
    [hasMovedSignificantly, lastQueriedBounds]
  );

  const handleMouseMove = useCallback((e: L.LeafletMouseEvent) => {
    setGhostPosition([e.latlng.lat, e.latlng.lng]);
  }, []);

  const handleMouseOut = useCallback(() => {
    setGhostPosition(null);
  }, []);

  const markAsQueried = useCallback((bounds: MapBounds) => {
    setLastQueriedBounds(bounds);
    setShowSearchButton(false);
  }, []);

  return {
    currentBounds,
    ghostPosition,
    showSearchButton,
    handleMapChange,
    handleMouseMove,
    handleMouseOut,
    markAsQueried,
  };
}
