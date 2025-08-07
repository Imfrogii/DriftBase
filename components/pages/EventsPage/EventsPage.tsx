import { Container, Box } from "@mui/material"
import { EventsFilters } from "@/components/pages/EventsPage/EventsFilters"
import { EventsList } from "@/components/pages/EventsPage/EventsList"
import { generateMockEvents } from "@/lib/utils/mockData"
import styles from "./EventsPage.module.scss"

interface EventsPageProps {
  searchParams: {
    level?: string
    priceMin?: string
    priceMax?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }
}

export async function EventsPage({ searchParams }: EventsPageProps) {
  // Generate mock events based on filters
  const mockEvents = generateMockEvents(searchParams)
  
  return (
    <div className={styles.eventsPage}>
      <Container maxWidth="xl">
        {/* Sticky Filters */}
        <Box className={styles.filtersContainer}>
          <EventsFilters searchParams={searchParams} />
        </Box>

        {/* Events List */}
        <Box className={styles.contentContainer}>
          <EventsList initialEvents={mockEvents} searchParams={searchParams} />
        </Box>
      </Container>
    </div>
  )
}
