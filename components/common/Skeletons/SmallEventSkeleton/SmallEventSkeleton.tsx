import { Card, Skeleton } from "@mui/material";
import styles from "./SmallEventSkeleton.module.scss";

export default function SmallEventSkeleton() {
  return (
    <Card className={styles.smallEventSkeleton}>
      <Skeleton variant="rectangular" className={styles.image} />
      <div className={styles.details}>
        <div className={styles.row}>
          <Skeleton variant="text" className={styles.title} />
          <Skeleton variant="text" className={styles.price} />
        </div>
        <Skeleton variant="text" className={styles.description} />
        <Skeleton variant="text" className={styles.description} />
        <div className={styles.rowWithGap}>
          <Skeleton variant="text" className={styles.location} />
          <Skeleton variant="text" className={styles.location} />
        </div>
        <div className={styles.rowWithGap}>
          <Skeleton variant="text" className={styles.location} />
          <Skeleton variant="text" className={styles.location} />
        </div>
        <Skeleton variant="text" className={styles.location} />
        <Skeleton variant="text" className={styles.buttons} />
      </div>
    </Card>
  );
}
