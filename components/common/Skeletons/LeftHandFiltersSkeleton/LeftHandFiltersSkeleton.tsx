import { Card, Skeleton } from "@mui/material";
import styles from "./LeftHandFiltersSkeleton.module.scss";
import OpenMapSkeleton from "../OpenMapSkeleton/OpenMapSkeleton";

export default function LeftHandFiltersSkeleton() {
  return (
    <div className={styles.fullSkeleton}>
      <OpenMapSkeleton />
      <Card className={styles.leftHandFiltersSkeleton}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div className={styles.filter} key={index}>
            <Skeleton variant="text" className={styles.filterName} />
            <Skeleton variant="text" className={styles.filterValues} />
            <Skeleton variant="text" className={styles.filterValues} />
            <Skeleton variant="text" className={styles.filterValues} />
          </div>
        ))}
      </Card>
    </div>
  );
}
