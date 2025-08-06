"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Container, Paper, Typography, TextField, Button, MenuItem, Box, Alert } from "@mui/material"
import { useAuth } from "@/lib/hooks/useAuth"
import { useEvent } from "@/lib/queries/events"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase/client"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { Event } from "@/lib/supabase/types"
import styles from "./EditEventPage.module.scss"
import { LocationPicker } from "@/components/common/LocationPicker/LocationPicker"
import type { Location } from "@/lib/types/location"

interface EditEventFormData {
  title: string
  description: string
  location_id: string
  event_date: string
  level: "beginner" | "street" | "pro"
  price: number
}

interface EditEventPageProps {
  eventId: string
}

export function EditEventPage({ eventId }: EditEventPageProps) {
  const t = useTranslations()
  const router = useRouter()
  const { user, loading } = useAuth()
  const { data: event, isLoading: eventLoading } = useEvent(eventId)
  const queryClient = useQueryClient()

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: Partial<Event>) => {
      const { data, error } = await supabase.from("events").update(eventData).eq("id", eventId).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] })
      queryClient.invalidateQueries({ queryKey: ["my-events"] })
      setMessage({ type: "success", text: "Event updated successfully!" })
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditEventFormData>()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (event) {
      // Check if user is the owner
      if (event.created_by !== user?.id) {
        router.push("/")
        return
      }

      // Format date for datetime-local input
      const eventDate = new Date(event.event_date)
      const formattedDate = eventDate.toISOString().slice(0, 16)

      reset({
        title: event.title,
        description: event.description || "",
        location_id: event.location_id,
        event_date: formattedDate,
        level: event.level,
        price: event.price,
      })

      // Set the selected location
      setSelectedLocation(event.location)
    }
  }, [event, user, reset, router])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setValue("location_id", location.id)
  }

  const onSubmit = async (data: EditEventFormData) => {
    try {
      await updateEventMutation.mutateAsync({
        ...data,
        // Convert date to ISO string
        event_date: new Date(data.event_date).toISOString(),
      })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update event. Please try again." })
    }
  }

  if (loading || eventLoading) {
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

  if (event.created_by !== user.id) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">You are not authorized to edit this event.</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" className={styles.container}>
      <Typography variant="h4" gutterBottom>
        Edit Event
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Paper className={styles.formPaper}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <TextField
            fullWidth
            label="Event Title"
            {...register("title", { required: "Title is required" })}
            error={!!errors.title}
            helperText={errors.title?.message}
            margin="normal"
          />

          <TextField fullWidth label="Description" multiline rows={4} {...register("description")} margin="normal" />

          <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event Location
            </Typography>
            <LocationPicker initialLocation={selectedLocation} onLocationSelect={handleLocationSelect} />
          </Box>

          <TextField
            fullWidth
            label="Event Date"
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
            label="Event Level"
            {...register("level", { required: "Level is required" })}
            error={!!errors.level}
            helperText={errors.level?.message}
            margin="normal"
          >
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="street">Street</MenuItem>
            <MenuItem value="pro">Professional</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Price (PLN)"
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
          />

          <Box className={styles.actions}>
            <Button type="button" variant="outlined" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={updateEventMutation.isPending}>
              {updateEventMutation.isPending ? "Updating..." : "Update Event"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
