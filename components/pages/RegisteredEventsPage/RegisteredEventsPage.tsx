"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
} from "@mui/material";
import {
  CalendarToday,
  LocationOn,
  EuroSymbol,
  DirectionsCar,
} from "@mui/icons-material";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRegistrations } from "@/lib/queries/registrations";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import styles from "./RegisteredEventsPage.module.scss";
import { TFilters } from "@/lib/types";

export function RegisteredEventsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [filters, setFilters] = useState<TFilters>({
    level: "",
    priceMax: "",
    dateFrom: "",
    dateTo: "",
  });
  const { data: registrations, isLoading } = useRegistrations(
    filters,
    user?.id
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  const handleFilterChange = (field: keyof TFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  // Filter registrations based on filters
  //   const filteredRegistrations = registrations?.filter((registration) => {
  //     const event = registration.event;
  //     if (!event) return false;

  //     // Filter by level
  //     if (filters.level && event.level !== filters.level) return false;

  //     // Filter by max price
  //     if (filters.priceMax && event.price > Number.parseFloat(filters.priceMax))
  //       return false;

  //     // Filter by date range
  //     const eventDate = new Date(event.event_date);
  //     if (filters.dateFrom && eventDate < new Date(filters.dateFrom))
  //       return false;
  //     if (filters.dateTo && eventDate > new Date(filters.dateTo)) return false;

  //     // Only show upcoming events
  //     return true;
  //     // eventDate >= new Date();
  //   });

  if (loading || isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Typography variant="h4" gutterBottom>
        My Registered Events
      </Typography>

      {/* Filters */}
      <Paper className={styles.filtersContainer}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Level</InputLabel>
              <Select
                value={filters.level}
                label="Level"
                onChange={(e) => handleFilterChange("level", e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="street">Street</MenuItem>
                <MenuItem value="pro">Professional</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Max Price (PLN)"
              type="number"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange("priceMax", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Date From"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Date To"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {registrations && registrations.length > 0 ? (
        <Grid container spacing={3}>
          {registrations.map((registration) => {
            const event = registration.event;
            const car = registration.car;

            return (
              <Grid item xs={12} md={6} lg={4} key={registration.id}>
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
                      <Chip
                        label={t(`events.levels.${event.level}`)}
                        color={getLevelColor(event.level)}
                        size="small"
                      />
                    </Box>

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
                          {/* {event.loca ||
                            `${event.location_lat}, ${event.location_lng}`} */}
                        </Typography>
                      </Box>

                      <Box className={styles.detail}>
                        <EuroSymbol fontSize="small" />
                        <Typography variant="body2">
                          {event.price} PLN
                        </Typography>
                      </Box>

                      <Box className={styles.detail}>
                        <DirectionsCar fontSize="small" />
                        <Typography variant="body2">
                          {car.make} {car.model} ({car.year})
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Alert severity="info">
          {registrations?.length === 0
            ? "You haven't registered for any events yet."
            : "No upcoming events match your filters."}
        </Alert>
      )}
    </Container>
  );
}
