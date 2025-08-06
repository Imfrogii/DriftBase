"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Container, Paper, TextField, Button, MenuItem, Box, Alert, Typography } from "@mui/material"
import { useCreateEvent } from "@/lib/queries/events"
import { useAuth } from "@/lib/hooks/useAuth"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar/Navbar"
import styles from "./CreateEventPage.module.scss"
import { LocationPicker } from "@/components/common/LocationPicker/LocationPicker"
import type { Location } from "@/lib/types/location"

interface CreateEventFormData {
  title: string
  description: string
  location_id: string
  event_date: string
  level: "beginner" | "street" | "pro"
  price: number
}

export function CreateEventPage() {
  const t = useTranslations()
  const { user, loading } = useAuth()
  const router = useRouter()
  const createEventMutation = useCreateEvent()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CreateEventFormData>()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setValue("location_id", location.id)
  }

  const onSubmit = async (data: CreateEventFormData) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    if (!user) return

    if (!selectedLocation) {
      setSubmitMessage({
        type: "error",
        text: "Please select a location for the event.",
      })
      setIsSubmitting(false)
      return
    }

    setError(null)

    try {
      await createEventMutation.mutateAsync({
        ...data,
        created_by: user.id,
        status: "pending",
      })

      setSubmitMessage({
        type: "success",
        text: "Event created successfully! It will be reviewed by administrators before being published.",
      })
      reset()
      setSelectedLocation(null)
    } catch (error: any) {
      setSubmitMessage({
        type: "error",
        text: "Failed to create event. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div>{t("common.loading")}</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className={styles.createEventPage}>
      <Navbar />

      <Container maxWidth="md" className={styles.container}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          {t("create_event.title")}
        </Typography>

        <Paper className={styles.formPaper}>
          {submitMessage && (
            <Alert severity={submitMessage.type} sx={{ mb: 3 }}>
              {submitMessage.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <TextField
              fullWidth
              label={t("create_event.form.title")}
              {...register("title", { required: "Title is required" })}
              error={!!errors.title}
              helperText={errors.title?.message}
              margin="normal"
            />

            <TextField
              fullWidth
              label={t("create_event.form.description")}
              multiline
              rows={4}
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
              margin="normal"
            />

            <Box sx={{ my: 3 }}>
              <Typography variant="h6" gutterBottom>
                Event Location
              </Typography>
              <LocationPicker initialLocation={selectedLocation} onLocationSelect={handleLocationSelect} />
            </Box>

            <TextField
              fullWidth
              label={t("create_event.form.date")}
              type="datetime-local"
              {...register("event_date", { required: "Date is required" })}
              error={!!errors.event_date}
              helperText={errors.event_date?.message}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
            />

            <TextField
              fullWidth
              select
              label={t("create_event.form.level")}
              {...register("level", { required: "Level is required" })}
              error={!!errors.level}
              helperText={errors.level?.message}
              margin="normal"
            >
              <MenuItem value="beginner">{t("filters.levels.beginner")}</MenuItem>
              <MenuItem value="street">{t("filters.levels.street")}</MenuItem>
              <MenuItem value="pro">{t("filters.levels.pro")}</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label={t("create_event.form.price")}
              type="number"
              step="0.01"
              {...register("price", {
                required: "Price is required",
                valueAsNumber: true,
                min: { value: 0, message: "Price must be positive" },
              })}
              error={!!errors.price}
              helperText={errors.price?.message}
              margin="normal"
              InputProps={{
                inputProps: { min: 0, step: 10 },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? t("common.loading") : t("create_event.form.submit")}
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  )
}
