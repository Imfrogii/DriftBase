import { Typography } from "@mui/material";
import styles from "./LocationInfoPanel.module.scss";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";

interface MarkerInfoPanelProps {
  mainText: string;
  subText: string;
  latitude: number;
  longitude: number;
  onViewLargerMap: () => void;
}

export default function LocationInfoPanel({
  mainText,
  subText,
  latitude,
  longitude,
  onViewLargerMap,
}: MarkerInfoPanelProps) {
  const link = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className={styles.markerInfoPanelWrapper}>
      <div className={styles.markerInfoPanel}>
        <Typography
          variant="body2"
          fontWeight={600}
          textTransform={"capitalize"}
        >
          {mainText}
        </Typography>
        <Typography variant="caption">{subText}</Typography>
        <button
          className={styles.viewLargerMapButton}
          onClick={onViewLargerMap}
        >
          <Typography variant="caption" color="primary">
            View larger map
          </Typography>
        </button>
      </div>
      <div>
        <a
          className={styles.directions}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <DirectionsOutlinedIcon fontSize="medium" color="primary" />
          <Typography variant="caption" color="primary">
            Directions
          </Typography>
        </a>
      </div>
    </div>
  );
}
