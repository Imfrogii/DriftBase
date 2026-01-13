import { Container, Box } from "@mui/material";
import styles from "./EventsPage.module.scss";
import { EventsList } from "@/components/common/EventsList/EventsList";
import { Suspense } from "react";
import EventListSkeleton from "@/components/common/Skeletons/EventListSkeleton";
import { EventsPageProps } from "@/app/[locale]/events/(events)/page";
import { LeftHandFiltersWrapper } from "@/components/common/LeftHandFiltersWrapper/LeftHandFiltersWrapper";
import { parseFilters } from "@/lib/helpers/filters";
import FullMapSkeleton from "@/components/common/Skeletons/FullMapSkeleton/FullMapSkeleton";

export async function EventsPage({ searchParams }: EventsPageProps) {
  const search = await searchParams;

  const key = parseFilters(search).toString();
  const isMapDefaultOpened = search.mapView === "true";

  return (
    <div className={styles.eventsPage}>
      <Container maxWidth="lg" className={styles.container}>
        <Box className={styles.filtersContainer}>
          <LeftHandFiltersWrapper
            searchParams={search}
            isMapDefaultOpened={isMapDefaultOpened}
          />
        </Box>

        <Box className={styles.contentContainer}>
          <Suspense
            fallback={
              !isMapDefaultOpened ? (
                <EventListSkeleton className={styles.skeleton} />
              ) : (
                <FullMapSkeleton />
              )
            }
            key={key}
          >
            <EventsList searchParams={search} />
          </Suspense>
        </Box>
      </Container>
    </div>
  );
}
