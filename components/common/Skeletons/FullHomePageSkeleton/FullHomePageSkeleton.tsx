import { Box, Container, Skeleton } from "@mui/material";
import styles from "./FullHomePageSkeleton.module.scss";

export default function FullHomePageSkeleton() {
  return (
    <div>
      <div className={styles.imageContainer}>
        <Container maxWidth="lg" className={styles.container}>
          <Skeleton className={styles.filters} />
          <Skeleton variant="rectangular" className={styles.headModal} />
        </Container>
      </div>
      <Container maxWidth="lg" className={styles.container}>
        <Skeleton className={styles.text} />
        {/* Newest events */}
        <div className={styles.row}>
          <Skeleton variant="rectangular" className={styles.event} />
          <Skeleton variant="rectangular" className={styles.event} />
          <Skeleton variant="rectangular" className={styles.event} />
        </div>
        {/* Map */}
        <Skeleton variant="rectangular" className={styles.map} />
      </Container>
    </div>
  );
}
