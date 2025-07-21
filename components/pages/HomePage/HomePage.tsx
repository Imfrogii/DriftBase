"use client"

import { useState, useMemo } from "react"
import {
  Container,
  Typography,
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from "@mui/material"
import { ViewList, Map as MapIcon } from "@mui/icons-material"
import { EventCard } from "@/components/common/EventCard/EventCard"
import { EventFilters } from "@/components/common/EventFilters/EventFilters"
import { useEvents } from "@/lib/queries/events"
import { useAuth } from "@/lib/hooks/useAuth"
import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"
import styles from "./HomePage.module.scss"

// Dynamically import map to avoid SSR issues
const DynamicEventMap = dynamic(
  () => import("@/components/common/EventMap/EventMap").then((mod) => ({ default: mod.EventMap })),
  {
    ssr: false,
    loading: () => (
      <Box className={styles.mapPlaceholder}>
        <CircularProgress />
      </Box>
    ),
  },
)

export function HomePage() {
  const t = useTranslations("events")
  const { user } = useAuth()

  const [view, setView] = useState<"list" | "map">("list")
  const [filters, setFilters] = useState({
    level: "",
    priceMin: "",
    priceMax: "",
    dateFrom: "",
    dateTo: "",
  })

  const queryFilters = useMemo(() => {
    const result: any = {}

    if (filters.level) result.level = filters.level
    if (filters.priceMin) result.priceMin = Number.parseFloat(filters.priceMin)
    if (filters.priceMax) result.priceMax = Number.parseFloat(filters.priceMax)
    if (filters.dateFrom) result.dateFrom = filters.dateFrom
    if (filters.dateTo) result.dateTo = filters.dateTo

    return result
  }, [filters])

  const { data: events, isLoading, error } = useEvents(queryFilters)

  const handleRegister = (eventId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = "/auth/signin"
      return
    }

    // Redirect to event details page
    window.location.href = `/events/${eventId}`
  }

  if (error) {
    return (
      <Container maxWidth="lg" className={styles.container}>
        <Alert severity="error">{t("loadError")}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h2" component="h1" className={styles.title}>
          {t("title")}
        </Typography>
        <Typography variant="h6" color="text.secondary" className={styles.subtitle}>
          {t("subtitle")}
        </Typography>
      </Box>

      <EventFilters filters={filters} onFiltersChange={setFilters} />

      <Box className={styles.viewToggle}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, newView) => newView && setView(newView)}
          aria-label="view mode"
        >
          <ToggleButton value="list" aria-label="list view">
            <ViewList />
            {t("listView")}
          </ToggleButton>
          <ToggleButton value="map" aria-label="map view">
            <MapIcon />
            {t("mapView")}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isLoading ? (
        <Box className={styles.loading}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {view === "list" ? (
            <Grid container spacing={3}>
              {events?.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard event={event} onRegister={handleRegister} showRegisterButton={!!user} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <DynamicEventMap events={events || []} onEventClick={(event) => handleRegister(event.id)} />
          )}

          {events?.length === 0 && (
            <Box className={styles.noEvents}>
              <Typography variant="h6" color="text.secondary">
                {t("noEvents")}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  )
}
