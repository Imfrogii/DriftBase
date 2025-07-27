"use client";

import { useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Grid,
  Alert,
} from "@mui/material";
import {
  CalendarToday,
  LocationOn,
  EuroSymbol,
  People,
  Edit,
} from "@mui/icons-material";
import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { EventWithRegistrations } from "@/lib/supabase/types";
import styles from "./MyEventsPage.module.scss";

export function MyEventsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, loading } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ["my-events", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          registrations(
            id,
            user:users(id, display_name, email),
            car:cars(id, make, model, year)
          )
        `
        )
        .eq("created_by", user.id)
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data as EventWithRegistrations[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "success";
      case "street":
        return "warning";
      case "pro":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  if (loading || isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Typography variant="h4" gutterBottom>
        My Events
      </Typography>

      {events && events.length > 0 ? (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Card className={styles.eventCard}>
                <CardContent>
                  <Box className={styles.header}>
                    <Typography
                      variant="h6"
                      component="h3"
                      className={styles.title}
                    >
                      {event.title}
                    </Typography>
                    <Box className={styles.chips}>
                      <Chip
                        label={t(`events.levels.${event.level}`)}
                        color={getLevelColor(event.level)}
                        size="small"
                      />
                      <Chip
                        label={t(`events.status.${event.status}`)}
                        color={getStatusColor(event.status)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  {event.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className={styles.description}
                    >
                      {event.description}
                    </Typography>
                  )}

                  <Box className={styles.details}>
                    <Box className={styles.detail}>
                      <CalendarToday fontSize="small" />
                      <Typography variant="body2">
                        {formatDate(event.event_date)}
                      </Typography>
                    </Box>

                    <Box className={styles.detail}>
                      <LocationOn fontSize="small" />
                      <Typography variant="body2">
                        {event.location_name ||
                          `${event.location_lat}, ${event.location_lng}`}
                      </Typography>
                    </Box>

                    <Box className={styles.detail}>
                      <EuroSymbol fontSize="small" />
                      <Typography variant="body2">{event.price} PLN</Typography>
                    </Box>

                    <Box className={styles.detail}>
                      <People fontSize="small" />
                      <Typography variant="body2">
                        {event.registrations?.length || 0} registered
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => router.push(`/event/${event.slug}/edit`)}
                  >
                    Edit Event
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info">
          You haven't created any events yet.{" "}
          <Button href="/events/create">Create your first event</Button>
        </Alert>
      )}
    </Container>
  );
}
