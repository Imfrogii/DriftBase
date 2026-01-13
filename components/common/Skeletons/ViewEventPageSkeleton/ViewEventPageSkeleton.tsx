import { Container, Skeleton } from "@mui/material";
import styles from "./ViewEventPageSkeleton.module.scss";

export default function ViewEventPageSkeleton() {
  return (
    <div>
      <div className={styles.imageContainer}>
        <Container maxWidth="lg" className={styles.headingContainer}>
          <Skeleton className={styles.name} />
          <div className={styles.rowWithSpace}>
            <Skeleton className={styles.headItem} />
            <Skeleton className={styles.headItem} />
            <Skeleton className={styles.headItem} />
            <Skeleton className={styles.headItem} />
            <Skeleton className={styles.headItem} />
          </div>
        </Container>
      </div>
      <Container maxWidth="lg" className={styles.headingContainer}>
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
        {/* Map */}
        <Skeleton variant="rectangular" className={styles.mapItem} />
        {/* Registered */}
        <div className={styles.row}>
          {Array.from({ length: 2 }).map((_, indexRow) => (
            <div className={styles.column} key={indexRow}>
              {Array.from({ length: 5 }).map((_, index) => (
                <div className={styles.registeredDriver} key={index}>
                  <Skeleton className={styles.driversName} />
                  <Skeleton className={styles.driversCar} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
