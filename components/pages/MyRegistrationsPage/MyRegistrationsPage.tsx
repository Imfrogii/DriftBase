import EventRowCard from "@/components/common/EventRowCard/EventRowCard";
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
import { Add } from "@mui/icons-material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";
import Pagination from "@/components/common/Pagination/Pagination";
import { MyEventsProps } from "@/app/[locale]/my-events/page";
import Link from "next/link";
import classNames from "classnames";
import styles from "./MyRegistrationsPage.module.scss";
import eventListStyles from "../../common/EventsList/EventsList.module.scss";
import { getMyRegistrations } from "@/lib/api/registrations";

const PAGE_SIZE = 5;

type MyRegistrationsPageProps = Omit<MyEventsProps, "params"> & {
  userId: string;
};

export async function MyRegistrationsPage({
  searchParams,
  userId,
}: MyRegistrationsPageProps) {
  const locale = await getLocale();
  const params = await searchParams;
  // TODO move request to FE and make this component as client
  const { registrations, totalItems } = await getMyRegistrations({
    page: Number(params?.page) || 1,
    size: PAGE_SIZE,
    userId,
  });

  const totalPages = totalItems ? Math.ceil(totalItems / PAGE_SIZE) : 0;

  if (!registrations?.length) {
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
            href={`/${locale}/events`}
          >
            Browse Events
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
          <Typography variant="h2">My Registrations</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            href={`/${locale}/events`}
          >
            Join Event
          </Button>
        </Box>
        <Alert
          severity="info"
          className={styles.alert}
          classes={{ message: styles.message }}
          variant="standard"
        >
          <Typography variant="body2" color="text.secondary">
            Здесь отображаются все ивенты, на которые вы зарегистрированы.
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
          {/* TODO edit buttons on card */}
          {registrations.map((registration) => (
            <EventRowCard
              key={registration.id}
              event={registration.event}
              registrationId={registration.id}
              locale={locale}
              isMyRegistrationsPage={true}
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
