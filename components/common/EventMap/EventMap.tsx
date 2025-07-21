"use client"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import type { EventWithCreator } from "@/lib/supabase/types"
import { Typography, Chip, Box } from "@mui/material"
import { useTranslations } from "next-intl"
import "leaflet/dist/leaflet.css"
import styles from "./EventMap.module.scss"

// Fix for default markers in react-leaflet
import L from "leaflet"
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
})

interface EventMapProps {
  events: EventWithCreator[]
  onEventClick?: (event: EventWithCreator) => void
  center?: [number, number]
  zoom?: number
}

export function EventMap({
  events,
  onEventClick,
  center = [52.2297, 21.0122], // Warsaw center
  zoom = 10,
}: EventMapProps) {
  const t = useTranslations("events")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "success"
      case "street":
        return "warning"
      case "pro":
        return "error"
      default:
        return "default"
    }
  }

  return (
    <div className={styles.mapContainer}>
      <MapContainer center={center} zoom={zoom} className={styles.map}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.location_lat, event.location_lng]}
            eventHandlers={{
              click: () => onEventClick?.(event),
            }}
          >
            <Popup>
              <Box className={styles.popup}>
                <Box className={styles.popupHeader}>
                  <Typography variant="h6" component="h3">
                    {event.title}
                  </Typography>
                  <Chip label={t(`levels.${event.level}`)} color={getLevelColor(event.level)} size="small" />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {formatDate(event.event_date)}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {event.price} PLN
                </Typography>

                {event.description && (
                  <Typography variant="body2" className={styles.description}>
                    {event.description}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
