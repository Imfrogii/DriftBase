"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Chip,
  Divider,
} from "@mui/material"
import { CalendarToday, LocationOn, EuroSymbol, Person, DirectionsCar } from "@mui/icons-material"
import { useAuth } from "@/lib/hooks/useAuth"
import { useEvent } from "@/lib/queries/events"
import { useCars } from "@/lib/queries/cars"
import { useCreateRegistration } from "@/lib/queries/registrations"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import styles from "./EventRegisterPage.module.scss"

interface RegisterFormData {
  car_id: string
}

interface EventRegisterPageProps {
  eventId: string
}

export function EventRegisterPage({ eventId }: EventRegisterPageProps) {
  const t = useTranslations()
  const router = useRouter()
  const { user, loading } = useAuth()
  const { data: event, isLoading: eventLoading } = useEvent(eventId)
  const { data: cars, isLoading: carsLoading } = useCars(user?.id)
  const createRegistrationMutation = useCreateRegistration()

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

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

  const onSubmit = async (data: RegisterFormData) => {
    if (!user || !event) return

    // Check if user is already registered
    const isAlreadyRegistered = event.registrations?.some((reg) => reg.user.id === user.id)
    if (isAlreadyRegistered) {
      setMessage({ type: "error", text: "You are already registered for this event." })
      return
    }

    try {
      await createRegistrationMutation.mutateAsync({
        user_id: user.id,
        event_id: eventId,
        car_id: data.car_id,
      })

      setMessage({ type: "success", text: "Successfully registered for the event!" })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/registered-events")
      }, 2000)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to register for the event. Please try again." })
    }
  }

  if (loading || eventLoading || carsLoading) {
    return <div>{t("common.loading")}</div>
  }

  if (!user) {
    return null
  }

  if (!event) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Event not found.</Alert>
      </Container>
    )
  }

  // Check if user is already registered
  const isAlreadyRegistered = event.registrations?.some((reg) => reg.user.id === user.id)

  // Check if user has cars
  if (!cars || cars.length === 0) {
    return (
      <Container maxWidth="md" className={styles.container}>
        <Alert severity="warning">
          You need to add at least one car to your profile before registering for events.
          <Button href="/profile" sx={{ ml: 2 }}>
            Go to Profile
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" className={styles.container}>
      <Typography variant="h4" gutterBottom>
        Register for Event
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Event Details */}
        <Grid item xs={12}>
          <Card className={styles.eventCard}>
            <CardContent>
              <Box className={styles.header}>
                <Typography variant="h5" component="h2">
                  {event.title}
                </Typography>
                <Chip label={t(`events.levels.${event.level}`)} color={getLevelColor(event.level)} />
              </Box>

              {event.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {event.description}
                </Typography>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box className={styles.detail}>
                    <CalendarToday />
                    <Typography>{formatDate(event.event_date)}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box className={styles.detail}>
                    <LocationOn />
                    <Typography>{event.location_name || `${event.location_lat}, ${event.location_lng}`}</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box className={styles.detail}>
                    <EuroSymbol />
                    <Typography>{event.price} PLN</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box className={styles.detail}>
                    <Person />
                    <Typography>{event.creator.display_name || event.creator.email}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Registered Participants ({event.registrations?.length || 0})
              </Typography>

              {event.registrations && event.registrations.length > 0 ? (
                <Box className={styles.participants}>
                  {event.registrations.map((registration) => (
                    <Box key={registration.id} className={styles.participant}>
                      <Typography variant="body2">
                        {registration.user.display_name || registration.user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {registration.car.make} {registration.car.model} ({registration.car.year})
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No participants yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Registration Form */}
        <Grid item xs={12}>
          <Paper className={styles.registrationForm}>
            <Typography variant="h6" gutterBottom>
              Registration Details
            </Typography>

            {isAlreadyRegistered ? (
              <Alert severity="info">
                You are already registered for this event.
                <Button href="/registered-events" sx={{ ml: 2 }}>
                  View My Registrations
                </Button>
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Your Car</InputLabel>
                  <Select
                    {...register("car_id", { required: "Please select a car" })}
                    error={!!errors.car_id}
                    label="Select Your Car"
                  >
                    {cars.map((car) => (
                      <MenuItem key={car.id} value={car.id}>
                        <Box className={styles.carOption}>
                          <DirectionsCar />
                          <Box>
                            <Typography>
                              {car.make} {car.model} ({car.year})
                            </Typography>
                            {car.power && (
                              <Typography variant="caption" color="text.secondary">
                                {car.power} HP
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.car_id && (
                    <Typography color="error" variant="caption">
                      {errors.car_id.message}
                    </Typography>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={createRegistrationMutation.isPending}
                  sx={{ mt: 3 }}
                >
                  {createRegistrationMutation.isPending ? "Registering..." : "Register for Event"}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
