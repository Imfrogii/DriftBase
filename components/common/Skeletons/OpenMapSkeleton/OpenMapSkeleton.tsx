import { Card, Skeleton } from "@mui/material";
import styles from "./OpenMapSkeleton.module.scss";

export default function OpenMapSkeleton() {
  return (
    <Card className={styles.mapSkeleton}>
      <Skeleton variant="rectangular" className={styles.map} />
    </Card>
  );
}
