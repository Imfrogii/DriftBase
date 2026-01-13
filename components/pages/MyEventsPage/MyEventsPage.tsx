import EventRowCard from "@/components/common/EventRowCard/EventRowCard";
import { getMyEvents } from "@/lib/api/events";
import { parseFilters } from "@/lib/helpers/filters";
import { roundCount } from "@/lib/helpers/numbers";
import {
  Box,
  Typography,
  Stack,
  Container,
  Button,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete, QrCode } from "@mui/icons-material";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import Pagination from "@/components/common/Pagination/Pagination";
import { MyEventsProps } from "@/app/[locale]/my-events/page";
import Link from "next/link";
import classNames from "classnames";
import styles from "./MyEventsPage.module.scss";
import eventListStyles from "../../common/EventsList/EventsList.module.scss";

const PAGE_SIZE = 5;

type MyEventsPageProps = Omit<MyEventsProps, "params"> & {
  userId: string;
};

export async function MyEventsPage({
  searchParams,
  userId,
}: MyEventsPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  // TODO move request to FE and make this component as client
  const { events, totalItems } = await getMyEvents({
    page: Number(params?.page) || 1,
    size: PAGE_SIZE,
    userId,
  });

  const totalPages = totalItems ? Math.ceil(totalItems / PAGE_SIZE) : 0;

  if (!events?.length) {
    return (
      <Container
        maxWidth="lg"
        className={classNames(styles.container, styles.containerEmpty)}
      >
        <Box className={styles.emptyState}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Nothing here yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Time to change that!
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            href={`/${locale}/events/create`}
          >
            Create Event
          </Button>
        </Box>
      </Container>
    );
  }

  const roundedTotalItems = totalItems ? roundCount(totalItems) : 0;

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box className={styles.header}>
        <Box className={styles.row}>
          <Typography variant="h2">My Events</Typography>
          <Box className={styles.actions}>
            <Button
              variant="outlined"
              startIcon={<QrCode />}
              component={Link}
              href={`/${locale}/scanner`}
            >
              Code Scanner
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              component={Link}
              href={`/${locale}/events/create`}
            >
              Create Event
            </Button>
          </Box>
        </Box>
        <Alert
          severity="info"
          className={styles.alert}
          classes={{ message: styles.message }}
          variant="standard"
        >
          <Typography variant="body2" color="text.secondary">
            Здесь отображаются все события, которые вы создали.
          </Typography>
        </Alert>
      </Box>
      <Box className={eventListStyles.eventsList}>
        <Box className={eventListStyles.resultsHeader}>
          <Typography
            variant="body2"
            color="text.secondary"
            className={eventListStyles.resultsInfo}
          >
            Found {roundedTotalItems}{" "}
            {roundedTotalItems !== totalItems ? "+" : ""} events
          </Typography>
        </Box>

        <Box className={eventListStyles.eventsContainer}>
          {events.map((event) => (
            <EventRowCard
              key={event.slug}
              locale={locale}
              event={event}
              isMyEventsPage={true}
            />
          ))}
        </Box>

        {totalPages > 1 && (
          <Box className={eventListStyles.paginationContainer}>
            <Stack spacing={2} alignItems="center">
              <Suspense fallback={<span>Loading pagination...</span>}>
                <Pagination
                  params={parseFilters(params).toString()}
                  totalPages={totalPages}
                  pageUrl={`/${locale}/my-events`}
                />
              </Suspense>
            </Stack>
          </Box>
        )}
      </Box>
    </Container>
  );
}
