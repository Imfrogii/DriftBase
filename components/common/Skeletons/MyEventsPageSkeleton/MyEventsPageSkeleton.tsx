import { Container, Skeleton } from "@mui/material";
import EventListSkeleton from "../EventListSkeleton";
import styles from "./MyEventsPageSkeleton.module.scss";

export function MyEventsPageSkeleton() {
  return (
    <Container maxWidth="lg" className={styles.container}>
      <div className={styles.row}>
        <Skeleton className={styles.title} />
        <Skeleton variant="rectangular" className={styles.button} />
      </div>
      <Skeleton variant="rectangular" className={styles.info} />

      <EventListSkeleton />
    </Container>
  );
}
