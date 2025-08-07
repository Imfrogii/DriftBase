"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Pagination, Stack } from "@mui/material"
import { useRouter, useSearchParams } from "next/navigation"
import { EventRowCard } from "./EventRowCard"
import { generateMockEvents, getTotalPages } from "@/lib/utils/mockData"
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
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  const currentPage = parseInt(searchParams.page || "1")
  const totalPages = getTotalPages(searchParams)
  const eventsPerPage = 10

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const params = new URLSearchParams(currentSearchParams.toString())
    params.set('page', page.toString())
    router.push(`/events?${params.toString()}`)
  }

  if (initialEvents.length === 0) {
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

  const startResult = (currentPage - 1) * eventsPerPage + 1
  const endResult = Math.min(currentPage * eventsPerPage, initialEvents.length + (currentPage - 1) * eventsPerPage)
  const totalResults = totalPages * eventsPerPage

  return (
    <Box className={styles.eventsList}>
      <Box className={styles.resultsHeader}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Drift Events
        </Typography>
        <Typography variant="body2" color="text.secondary" className={styles.resultsInfo}>
          Showing {startResult}-{endResult} of {totalResults}+ results
        </Typography>
      </Box>

      <Box className={styles.eventsContainer}>
        {initialEvents.map((event, index) => (
          <EventRowCard key={event.id} event={event} />
        ))}
      </Box>

      {totalPages > 1 && (
        <Box className={styles.paginationContainer}>
          <Stack spacing={2} alignItems="center">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              siblingCount={2}
              boundaryCount={1}
              className={styles.pagination}
            />
            <Typography variant="body2" color="text.secondary">
              Page {currentPage} of {totalPages}
            </Typography>
          </Stack>
        </Box>
      )}
    </Box>
  )
}
