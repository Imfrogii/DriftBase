"use client"

import { Marker } from "react-leaflet"
import L from "leaflet"
import type { Location } from "@/lib/types/location"

// Custom icons
const draggableIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const locationIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
  className: "location-marker",
})

const ghostIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "ghost-marker",
})

interface MapMarkersProps {
  nearbyLocations: Location[]
  selectedPosition: [number, number] | null
  ghostPosition: [number, number] | null
  onMarkerClick: (location: Location) => void
  onMarkerDrag: (e: L.DragEndEvent) => void
}

export function MapMarkers({
  nearbyLocations,
  selectedPosition,
  ghostPosition,
  onMarkerClick,
  onMarkerDrag,
}: MapMarkersProps) {
  return (
    <>
      {/* Nearby location markers (50% transparent) */}
      {nearbyLocations.map((location) => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
          icon={locationIcon}
          eventHandlers={{
            click: () => onMarkerClick(location),
          }}
        />
      ))}

      {/* Ghost marker on hover */}
      {ghostPosition && !selectedPosition && <Marker position={ghostPosition} icon={ghostIcon} />}

      {/* Selected position marker (draggable) */}
      {selectedPosition && (
        <Marker
          position={selectedPosition}
          draggable={true}
          icon={draggableIcon}
          eventHandlers={{
            dragend: onMarkerDrag,
          }}
        />
      )}
    </>
  )
}
