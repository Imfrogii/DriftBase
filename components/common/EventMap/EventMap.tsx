"use client";

import { useState, useCallback } from "react";
import { Box, Typography, Chip, Paper } from "@mui/material";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import type { EventWithCreator } from "@/lib/supabase/types";
import { useTranslations } from "next-intl";
import styles from "./EventMap.module.scss";

interface EventMapProps {
  events: EventWithCreator[];
  onEventClick?: (event: EventWithCreator) => void;
  center?: [number, number];
  zoom?: number;
}

const INITIAL_VIEW_STATE = {
  longitude: 21.0122,
  latitude: 52.2297,
  zoom: 10,
};

export function EventMap({
  events,
  onEventClick,
  center = [52.2297, 21.0122],
  zoom = 10,
}: EventMapProps) {
  const t = useTranslations("events");
  const [selectedEvent, setSelectedEvent] = useState<EventWithCreator | null>(
    null
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "success";
      case "street":
        return "warning";
      case "pro":
        return "error";
      default:
        return "default";
    }
  };

  const handleMarkerClick = useCallback(
    (event: EventWithCreator) => {
      setSelectedEvent(event);
      onEventClick?.(event);
    },
    [onEventClick]
  );

  return (
    <Box className={styles.mapContainer}>
      <Map
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        <NavigationControl position="top-right" />

        {events.map((event) => (
          <Marker
            key={event.id}
            longitude={event.location.longitude}
            latitude={event.location.latitude}
            onClick={() => handleMarkerClick(event)}
          >
            <Box className={styles.eventMarker}>
              <Box className={`${styles.markerDot} ${styles[event.level]}`} />
            </Box>
          </Marker>
        ))}

        {selectedEvent && (
          <Popup
            longitude={selectedEvent.location.longitude}
            latitude={selectedEvent.location.latitude}
            onClose={() => setSelectedEvent(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <Paper className={styles.popup} elevation={0}>
              <Box className={styles.popupHeader}>
                <Typography variant="h6" component="h3">
                  {selectedEvent.title}
                </Typography>
                <Chip
                  label={t(`levels.${selectedEvent.level}`)}
                  color={getLevelColor(selectedEvent.level)}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                {formatDate(selectedEvent.event_date)}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {selectedEvent.location.name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {selectedEvent.price} PLN
              </Typography>

              {selectedEvent.description && (
                <Typography variant="body2" className={styles.description}>
                  {selectedEvent.description}
                </Typography>
              )}
            </Paper>
          </Popup>
        )}
      </Map>
    </Box>
  );
}
