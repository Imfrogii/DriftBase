"use client"
import { Card, CardContent, CardActions, Typography, Chip, Box } from "@mui/material"
import { CalendarToday, LocationOn, EuroSymbol, Person } from "@mui/icons-material"
import type { EventWithCreator } from "@/lib/supabase/types"
import { Button } from "../Button/Button"
import { useTranslations } from "next-intl"
import styles from "./EventCard.module.scss"

interface EventCardProps {
  event: EventWithCreator
  onRegister?: (eventId: string) => void
  showRegisterButton?: boolean
  loading?: boolean
}

export function EventCard({ event, onRegister, showRegisterButton = true, loading }: EventCardProps) {
  const t = useTranslations("events")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
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

  return (
    <Card className={styles.card}>
      <CardContent>
        <Box className={styles.header}>
          <Typography variant="h6" component="h3" className={styles.title}>
            {event.title}
          </Typography>
          <Chip label={t(`levels.${event.level}`)} color={getLevelColor(event.level)} size="small" />
        </Box>

        <Typography variant="body2" color="text.secondary" className={styles.description}>
          {event.description}
        </Typography>

        <Box className={styles.details}>
          <Box className={styles.detail}>
            <CalendarToday fontSize="small" />
            <Typography variant="body2">{formatDate(event.event_date)}</Typography>
          </Box>

          <Box className={styles.detail}>
            <LocationOn fontSize="small" />
            <Typography variant="body2">{event.location.name}</Typography>
          </Box>

          <Box className={styles.detail}>
            <EuroSymbol fontSize="small" />
            <Typography variant="body2">{event.price} PLN</Typography>
          </Box>

          <Box className={styles.detail}>
            <Person fontSize="small" />
            <Typography variant="body2">{event.creator.display_name || event.creator.email}</Typography>
          </Box>
        </Box>
      </CardContent>

      {showRegisterButton && (
        <CardActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onRegister?.(event.id)}
            loading={loading}
            fullWidth
          >
            {t("register")}
          </Button>
        </CardActions>
      )}
    </Card>
  )
}
