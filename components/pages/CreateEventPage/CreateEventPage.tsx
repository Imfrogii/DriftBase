"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from "@mui/material"
import { Button } from "@/components/common/Button/Button"
import { useCreateEvent } from "@/lib/queries/events"
import { useAuth } from "@/lib/hooks/useAuth"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import styles from "./CreateEventPage.module.scss"

interface CreateEventFormData {
  title: string
  description: string
  location_name: string
  location_lat: number
  location_lng: number
  event_date: string
  level: "beginner" | "street" | "pro"
  price: number
}

export function CreateEventPage() {
  const t = useTranslations("events")
  const { user } = useAuth()
  const router = useRouter()
  const createEventMutation = useCreateEvent()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateEventFormData>()

  React.useEffect(() => {
    if (!user) {
      router.push("/auth/signin")
    }
  }, [user, router])

  const onSubmit = async (data: CreateEventFormData) => {
    if (!user) return

    setError(null)

    try {
      await createEventMutation.mutateAsync({
        ...data,
        created_by: user.id,
        status: "pending",
      })

      router.push("/")
    } catch (error: any) {
      setError(error.message)
    }
  }

  // Simple location picker (in a real app, you'd use a map picker)
  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("location_lat", position.coords.latitude)
          setValue("location_lng", position.coords.longitude)
        },
        () => {
          // Default to Warsaw center
          setValue("location_lat", 52.2297)
          setValue("location_lng", 21.0122)
        },
      )
    }
  }

  if (!user) {
    return null
  }

  return (
    <Container maxWidth="md" className={styles.container}>
      <Paper className={styles.paper}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Create New Event
        </Typography>

        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <TextField
            fullWidth
            label="Event Title"
            {...register("title", { required: "Title is required" })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />

          <TextField
            fullWidth
            label="Location Name"
            placeholder="e.g., Warsaw Drift Track"
            {...register("location_name")}
            error={!!errors.location_name}
            helperText={errors.location_name?.message}
          />

          <Box className={styles.locationInputs}>
            <TextField
              label="Latitude"
              type="number"
              step="any"
              {...register("location_lat", {
                required: "Latitude is required",
                valueAsNumber: true,
              })}
              error={!!errors.location_lat}
              helperText={errors.location_lat?.message}
            />
            <TextField
              label="Longitude"
              type="number"
              step="any"
              {...register("location_lng", {
                required: "Longitude is required",
                valueAsNumber: true,
              })}
              error={!!errors.location_lng}
              helperText={errors.location_lng?.message}
            />
            <Button type="button" variant="outlined" onClick={handleLocationClick} className={styles.locationButton}>
              Use My Location
            </Button>
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
          />

          <FormControl fullWidth>
            <InputLabel>Level</InputLabel>
            <Select
              {...register("level", { required: "Level is required" })}
              error={!!errors.level}
              label="Level"
              defaultValue=""
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="street">Street</MenuItem>
              <MenuItem value="pro">Professional</MenuItem>
            </Select>
          </FormControl>

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
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            loading={createEventMutation.isPending}
            className={styles.submitButton}
          >
            Create Event
          </Button>

          <Alert severity="info">Your event will be reviewed by administrators before being published.</Alert>
        </Box>
      </Paper>
    </Container>
  )
}
