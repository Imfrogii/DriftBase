import { Container, Typography, Button, Card } from "@mui/material";
import styles from "./ScannerResult.module.scss";

import { Error, Refresh } from "@mui/icons-material";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getErrorTranslation } from "@/lib/helpers/getErrorTranslation";

export async function ScannerError({
  redirectUrl,
  message,
}: {
  redirectUrl: string;
  message: string;
}) {
  const t = await getTranslations();

  return (
    <Container className={styles.container}>
      <Card className={styles.center}>
        <Error color="secondary" fontSize="large" />
        <Typography variant="h5" gutterBottom>
          Верификация не удалась
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          mb={"1.5rem"}
        >
          {getErrorTranslation(t, message, "scanner")}
        </Typography>
        <Button
          variant="outlined"
          size="large"
          component={Link}
          href={redirectUrl}
          startIcon={<Refresh />}
          className={styles.redirectButton}
        >
          Попробовать еще раз
        </Button>
      </Card>
    </Container>
  );
}
