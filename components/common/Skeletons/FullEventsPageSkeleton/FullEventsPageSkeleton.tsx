import { Box, Container } from "@mui/material";
import styles from "../../../pages/EventsPage/EventsPage.module.scss";
import EventListSkeleton from "../EventListSkeleton";
import LeftHandFiltersSkeleton from "../LeftHandFiltersSkeleton/LeftHandFiltersSkeleton";

export default function FullEventsPageSkeleton() {
  return (
    <div className={styles.eventsPage}>
      <Container maxWidth="lg" className={styles.container}>
        <Box className={styles.filtersContainer}>
          <LeftHandFiltersSkeleton />
        </Box>
        <Box className={styles.contentContainer}>
          <EventListSkeleton className={styles.eventListSkeleton} />
        </Box>
      </Container>
    </div>
  );
}
