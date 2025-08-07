"use client"

import { useState, useEffect, useCallback } from "react"
import { Box, Typography, CircularProgress } from "@mui/material"
import { EventRowCard } from "./EventRowCard"
import { generateMockEvents } from "@/lib/utils/mockData"
import type { EventWithCreator } from "@/lib/supabase/types"
import styles from "./EventsList.module.scss"

interface EventsListProps {
  initialEvents: EventWithCreator[]
  searchParams: {
    level?: string
    priceMin?: string
    priceMax?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }
}

export function EventsList({ initialEvents, searchParams }: EventsListProps) {
  const [events, setEvents] = useState<EventWithCreator[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // Reset events when search params change
  useEffect(() => {
    setEvents(initialEvents)
    setPage(1)
    setHasMore(true)
  }, [initialEvents])

  const loadMoreEvents = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate more mock events for the next page
    const nextPage = page + 1
    const moreEvents = generateMockEvents({ ...searchParams, page: nextPage.toString() })
    
    if (moreEvents.length === 0) {
      setHasMore(false)
    } else {
      setEvents(prev => [...prev, ...moreEvents])
      setPage(nextPage)
    }
    
    setLoading(false)
  }, [loading, hasMore, page, searchParams])

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMoreEvents()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMoreEvents])

  if (events.length === 0 && !loading) {
    return (
      <Box className={styles.emptyState}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No events found
        </Typography>
        <Typography color="text.secondary">
          Try adjusting your filters to find more events.
        </Typography>
      </Box>
    )
  }

  return (
    <Box className={styles.eventsList}>
      <Typography variant="h4" component="h1" gutterBottom className={styles.title}>
        Drift Events ({events.length}+ results)
      </Typography>

      <Box className={styles.eventsContainer}>
        {events.map((event, index) => (
          <EventRowCard key={`${event.id}-${index}`} event={event} />
        ))}
      </Box>

      {loading && (
        <Box className={styles.loadingContainer}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading more events...
          </Typography>
        </Box>
      )}

      {!hasMore && events.length > 0 && (
        <Box className={styles.endMessage}>
          <Typography variant="body2" color="text.secondary">
            You've reached the end of the events list.
          </Typography>
        </Box>
      )}
    </Box>
  )
}
