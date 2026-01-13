import { Box, Typography, Stack } from "@mui/material";
import EventRowCard from "../EventRowCard/EventRowCard";
import styles from "./EventsList.module.scss";
import { getLocale, getTranslations } from "next-intl/server";
import Pagination from "../Pagination/Pagination";
import { roundCount } from "@/lib/helpers/numbers";
import { getEvents } from "@/lib/api/events";
import { Suspense } from "react";
import {
  generateFiltersFromParams,
  parseFilters,
  SearchParamsFilters,
} from "@/lib/helpers/filters";

interface EventsListProps {
  searchParams: SearchParamsFilters & {
    page?: string;
  };
}

const PAGE_SIZE = 20;

export async function EventsList({ searchParams }: EventsListProps) {
  const locale = await getLocale();
  const t = await getTranslations();
  const parsedParams = generateFiltersFromParams(searchParams);
  const { events, totalItems } = await getEvents({
    ...parsedParams,
    page: Number(searchParams?.page) || 1,
    size: PAGE_SIZE,
  });
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  if (events.length === 0) {
    return (
      <Box className={styles.emptyState}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No events found
        </Typography>
        <Typography color="text.secondary">
          Try adjusting your filters to find more events.
        </Typography>
      </Box>
    );
  }

  const roundedTotalItems = roundCount(totalItems);

  return (
    <Box className={styles.eventsList}>
      <Box className={styles.resultsHeader}>
        <Typography
          variant="body2"
          color="text.secondary"
          className={styles.resultsInfo}
        >
          Found {roundedTotalItems}{" "}
          {roundedTotalItems !== totalItems ? "+" : ""} events
        </Typography>
      </Box>

      <Box className={styles.eventsContainer}>
        {events.map((event) => (
          <EventRowCard key={event.slug} event={event} locale={locale} t={t} />
        ))}
      </Box>

      {/* {totalPages <= 1 && <Box className={styles.paginationPlaceholder} />} */}

      {totalPages > 1 && (
        <Box className={styles.paginationContainer}>
          <Stack spacing={2} alignItems="center">
            <Suspense fallback={<span>Loading pagination...</span>}>
              <Pagination
                params={parseFilters(parsedParams).toString()}
                totalPages={totalPages}
              />
            </Suspense>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
