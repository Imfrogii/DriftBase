'use client'

import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { useMyEvents } from '@/lib/queries/events'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { EventFilters } from '@/components/common/EventFilters/EventFilters'
import styles from './MyEventsPage.module.scss'

export function MyEventsPage() {
  const t = useTranslations()
  const router = useRouter()
  const [filters, setFilters] = useState({
    level: '',
    priceMin: 0,
    priceMax: 1000,
    dateFrom: '',
    dateTo: '',
  })

  const { data: events, isLoading, error } = useMyEvents(filters)

  const handleCreateEvent = () => {
    router.push('/events/create')
  }

  const handleEditEvent = (eventSlug: string) => {
    router.push(`/events/${eventSlug}/edit`)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      // Delete event logic would go here
      console.log('Delete event:', eventId)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'success'
      case 'street':
        return 'warning'
      case 'pro':
        return 'error'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" className={styles.container}>
        <Typography>{t('common.loading')}</Typography>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" className={styles.container}>
        <Alert severity="error">Failed to load events</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateEvent}
        >
          Create Event
        </Button>
      </Box>

      <EventFilters filters={filters} onFiltersChange={setFilters} />

      {events && events.length > 0 ? (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Card className={styles.eventCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {event.location?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {new Date(event.event_date).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={event.level}
                      color={getLevelColor(event.level) as any}
                      size="small"
                    />
                    <Chip
                      label={`$${event.price}`}
                      variant="outlined"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {event.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditEvent(event.slug)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box className={styles.emptyState}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events created yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create your first event to start organizing motorsport activities!
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateEvent}
          >
            Create Your First Event
          </Button>
        </Box>
      )}
    </Container>
  )
}
