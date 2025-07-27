"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
} from "@mui/material";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEvent } from "@/lib/queries/events";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { Event } from "@/lib/supabase/types";
import styles from "./EditEventPage.module.scss";
import { LocationPicker } from "@/components/common/LocationPicker_prev/LocationPicker";

interface EditEventFormData {
  title: string;
  description: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  event_date: string;
  level: "beginner" | "street" | "pro";
  price: number;
}

interface EditEventPageProps {
  eventSlug: string;
}

export function EditEventPage({ eventSlug }: EditEventPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { data: event, isLoading: eventLoading } = useEvent(eventSlug);
  const queryClient = useQueryClient();

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: Partial<Event>) => {
      const { data, error } = await supabase
        .from("events")
        .update(eventData)
        .eq("slug", eventSlug)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventSlug] });
      queryClient.invalidateQueries({ queryKey: ["my-events"] });
      setMessage({ type: "success", text: "Event updated successfully!" });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditEventFormData>();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (event && !loading) {
      // Check if user is the owner
      if (event.created_by !== user?.id) {
        router.push("/");
        return;
      }

      // Format date for datetime-local input
      const eventDate = new Date(event.event_date);
      const formattedDate = eventDate.toISOString().slice(0, 16);

      reset({
        title: event.title,
        description: event.description || "",
        location_name: event.location_name || "",
        location_lat: event.location_lat,
        location_lng: event.location_lng,
        event_date: formattedDate,
        level: event.level,
        price: event.price,
      });
    }
  }, [event, user, reset, router]);

  const onSubmit = async (data: EditEventFormData) => {
    try {
      await updateEventMutation.mutateAsync({
        ...data,
        // Convert date to ISO string
        event_date: new Date(data.event_date).toISOString(),
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update event. Please try again.",
      });
    }
  };

  //   const handleLocationClick = () => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           reset((prev) => ({
  //             ...prev,
  //             location_lat: position.coords.latitude,
  //             location_lng: position.coords.longitude,
  //           }));
  //         },
  //         () => {
  //           // Default to Warsaw center
  //           reset((prev) => ({
  //             ...prev,
  //             location_lat: 52.2297,
  //             location_lng: 21.0122,
  //           }));
  //         }
  //       );
  //     }
  //   };

  if (loading || eventLoading) {
    return <div>{t("common.loading")}</div>;
  }

  if (!user) {
    return null;
  }

  if (!event) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Event not found.</Alert>
      </Container>
    );
  }

  if (event.created_by !== user.id) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          You are not authorized to edit this event.
        </Alert>
      </Container>
    );
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
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          className={styles.form}
        >
          <TextField
            fullWidth
            label="Event Title"
            {...register("title", { required: "Title is required" })}
            error={!!errors.title}
            helperText={errors.title?.message}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            {...register("description")}
            margin="normal"
          />

          {/* <TextField
            fullWidth
            label="Location Name"
            placeholder="e.g., Warsaw Drift Track"
            {...register("location_name")}
            margin="normal"
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                {...register("location_lat", {
                  required: "Latitude is required",
                  valueAsNumber: true,
                })}
                error={!!errors.location_lat}
                helperText={errors.location_lat?.message}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                {...register("location_lng", {
                  required: "Longitude is required",
                  valueAsNumber: true,
                })}
                error={!!errors.location_lng}
                helperText={errors.location_lng?.message}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                type="button"
                variant="outlined"
                onClick={handleLocationClick}
                sx={{ mt: 2, height: 56 }}
                fullWidth
              >
                Use My Location
              </Button>
            </Grid>
          </Grid> */}

          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>
              Event Location
            </Typography>
            <LocationPicker
              initialLocation={
                event
                  ? {
                      name: event.location_name || "",
                      latitude: event.location_lat,
                      longitude: event.location_lng,
                    }
                  : undefined
              }
              onLocationSelect={(location) => {
                setValue("location_name", location.name);
                setValue("location_lat", location.latitude);
                setValue("location_lng", location.longitude);
              }}
              height={400}
            />
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
            <Button
              type="button"
              variant="outlined"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={updateEventMutation.isPending}
            >
              {updateEventMutation.isPending ? "Updating..." : "Update Event"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
