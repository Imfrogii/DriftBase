import { Box, CircularProgress } from "@mui/material";
import styles from "./FullMapSkeleton.module.scss";

export default function FullMapSkeleton() {
  return (
    <Box className={styles.openMapSkeleton}>
      <CircularProgress size={32} className={styles.loadingIndicator} />
    </Box>
  );
}
