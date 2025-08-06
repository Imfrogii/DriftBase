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
import { DirectionsCar, Cancel } from '@mui/icons-material'
import { useRegistrations } from '@/lib/queries/registrations'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import styles from './RegisteredEventsPage.module.scss'

export function RegisteredEventsPage() {
  const t = useTranslations()
  const router = useRouter()
  const [filters] = useState({
    level: '',
    priceMax: 1000,
  })

  const { data: registrations, isLoading, error } = useRegistrations(filters)

  const handleCancelRegistration = (registrationId: string) => {
    if (window.confirm('Are you sure you want to cancel this registration?')) {
      // Cancel registration logic would go here
      console.log('Cancel registration:', registrationId)
    }
  }

  const handleViewEvent = (eventSlug: string) => {
    router.push(`/events/${eventSlug}`)
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
        <Alert severity="error">Failed to load registrations</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Registrations
        </Typography>
      </Box>

      {registrations && registrations.length > 0 ? (
        <Grid container spacing={3}>
          {registrations.map((registration) => (
            <Grid item xs={12} md={6} lg={4} key={registration.id}>
              <Card className={styles.registrationCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {registration.event.title}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {registration.event.location?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {new Date(registration.event.event_date).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={registration.event.level}
                      color={getLevelColor(registration.event.level) as any}
                      size="small"
                    />
                    <Chip
                      label={`$${registration.event.price}`}
                      variant="outlined"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DirectionsCar sx={{ mr: 1, fontSize: 16 }} />
                    <Typography variant="body2">
                      {registration.car.make} {registration.car.model} ({registration.car.year})
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Registered: {new Date(registration.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleViewEvent(registration.event.slug)}
                  >
                    View Event
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => handleCancelRegistration(registration.id)}
                  >
                    Cancel
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box className={styles.emptyState}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No registrations yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Browse events and register for your first motorsport activity!
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/events')}
          >
            Browse Events
          </Button>
        </Box>
      )}
    </Container>
  )
}
