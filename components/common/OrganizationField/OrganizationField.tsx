import React from "react";
import { TextField, Typography, Box, Link } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import styles from "./OrganizationField.module.scss";

interface OrganizationFieldProps {
  organizationName: string;
  isVerified: boolean;
  onNameChange: (value: string) => void;
  platformInstagram: string; // например "driftpolska"
}

export const OrganizationField: React.FC<OrganizationFieldProps> = ({
  organizationName,
  isVerified,
  onNameChange,
  platformInstagram,
}) => {
  const hasName = organizationName.trim().length > 0;

  return (
    <Box className={styles.container}>
      <TextField
        fullWidth
        label="Организация / команда"
        placeholder="Drift Garage Poland"
        value={organizationName}
        onChange={(e) => onNameChange(e.target.value)}
        variant="outlined"
        inputProps={{ maxLength: 80 }}
        helperText="Необязательно. Только для официальных организаторов, треков и команд"
      />

      {/* Верифицировано */}
      {isVerified && (
        <Box className={styles.verified}>
          <CheckCircleOutlineIcon className={styles.checkIcon} />
          <Typography variant="body2" className={styles.verifiedText}>
            Верифицировано ✓
          </Typography>
        </Box>
      )}

      {/* Подсказка для неверифицированных с именем */}
      {!isVerified && hasName && (
        <Box className={styles.hintBox}>
          <Typography variant="body2" className={styles.hintTitle}>
            Хочешь галочку ✓ и создавать ивенты от имени организации?
          </Typography>

          <Link
            href={`https://instagram.com/${platformInstagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramButton}
          >
            <InstagramIcon className={styles.igIcon} />
            Написать в Instagram → @{platformInstagram}
          </Link>

          <Typography variant="caption" className={styles.hintFooter}>
            Мы включим галочку за 5–30 минут · навсегда
          </Typography>
        </Box>
      )}

      {/* Маленький хинт, если поле пустое */}
      {!isVerified && !hasName && (
        <Typography variant="caption" className={styles.emptyHint}>
          Официальные треки, команды и организаторы могут получить верификацию ✓
        </Typography>
      )}
    </Box>
  );
};
