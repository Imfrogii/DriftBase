"use client";

import { useMapEvents } from "react-leaflet";
import type L from "leaflet";

interface MapBounds {
  center: { lat: number; lng: number };
  bounds: L.LatLngBounds;
  zoom: number;
}

interface MapEventsProps {
  onMapChange: (bounds: MapBounds) => void;
  onMouseMove: (e: L.LeafletMouseEvent) => void;
  onMouseOut: () => void;
  onClick: (e: L.LeafletMouseEvent) => void;
}

export function MapEvents({
  onMapChange,
  onMouseMove,
  onMouseOut,
  onClick,
}: MapEventsProps) {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onMapChange({ center, bounds, zoom });
    },
    zoomend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      onMapChange({ center, bounds, zoom });
    },
    mousemove: onMouseMove,
    mouseout: onMouseOut,
    click: onClick,
  });

  return null;
}
