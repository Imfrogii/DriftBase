import { Container, Typography, Button, Card } from "@mui/material";
import styles from "./PaymentResult.module.scss";

import { Error, Refresh } from "@mui/icons-material";
import Link from "next/link";

export function PaymentError({
  redirectUrl,
  message,
}: {
  redirectUrl: string;
  message: string;
}) {
  return (
    <Container className={styles.container}>
      <Card className={styles.center}>
        <Error color="secondary" fontSize="large" />
        <Typography variant="h5" gutterBottom>
          Оплата не удалась
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          mb={"1.5rem"}
        >
          {message}
        </Typography>
        <Button
          variant="outlined"
          size="large"
          component={Link}
          href={redirectUrl}
          startIcon={<Refresh />}
          className={styles.redirectButton}
        >
          Вернуться к ивенту
        </Button>
      </Card>
    </Container>
  );
}
