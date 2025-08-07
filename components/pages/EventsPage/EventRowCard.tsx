"use client"

import { Card, CardContent, Box, Typography, Chip, Button, Avatar } from "@mui/material"
import { CalendarToday, LocationOn, EuroSymbol, Person, DirectionsCar } from "@mui/icons-material"
import { useRouter } from "next/navigation"
import type { EventWithCreator } from "@/lib/supabase/types"
import styles from "./EventRowCard.module.scss"

interface EventRowCardProps {
  event: EventWithCreator
}

export function EventRowCard({ event }: EventRowCardProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const handleViewDetails = () => {
    router.push(`/events/${event.id}`)
  }

  const handleRegister = () => {
    router.push(`/events/${event.id}/register`)
  }

  return (
    <Card className={styles.eventCard}>
      <CardContent className={styles.cardContent}>
        <Box className={styles.eventRow}>
          {/* Event Image */}
          <Box className={styles.imageContainer}>
            <img
              src={`/placeholder.svg?height=120&width=200&text=${encodeURIComponent(event.title)}`}
              alt={event.title}
              className={styles.eventImage}
            />
            <Chip
              label={event.level}
              color={getLevelColor(event.level)}
              size="small"
              className={styles.levelChip}
            />
          </Box>

          {/* Event Info */}
          <Box className={styles.eventInfo}>
            <Box className={styles.eventHeader}>
              <Typography variant="h6" component="h3" className={styles.eventTitle}>
                {event.title}
              </Typography>
              <Typography variant="h6" color="primary" className={styles.eventPrice}>
                {event.price} PLN
              </Typography>
            </Box>

            {event.description && (
              <Typography variant="body2" color="text.secondary" className={styles.eventDescription}>
                {event.description}
              </Typography>
            )}

            <Box className={styles.eventDetails}>
              <Box className={styles.detailsRow}>
                <Box className={styles.detail}>
                  <CalendarToday fontSize="small" />
                  <Typography variant="body2">{formatDate(event.event_date)}</Typography>
                </Box>

                <Box className={styles.detail}>
                  <LocationOn fontSize="small" />
                  <Typography variant="body2">{event.location?.name || "Location TBD"}</Typography>
                </Box>
              </Box>

              <Box className={styles.detailsRow}>
                <Box className={styles.detail}>
                  <Person fontSize="small" />
                  <Typography variant="body2">
                    {event.creator.display_name || event.creator.email}
                  </Typography>
                </Box>

                <Box className={styles.detail}>
                  <DirectionsCar fontSize="small" />
                  <Typography variant="body2">
                    {Math.floor(Math.random() * 20) + 5} registered
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className={styles.eventActions}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleViewDetails}
                className={styles.actionButton}
              >
                View Details
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleRegister}
                className={styles.actionButton}
              >
                Register
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
