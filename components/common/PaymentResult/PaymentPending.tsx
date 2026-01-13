import {
  Container,
  Box,
  CircularProgress,
  Typography,
  Card,
} from "@mui/material";
import PaymentPollingClient from "./PaymentPollingClient";
import styles from "./PaymentResult.module.scss";

export async function PaymentPending({ sessionId }: { sessionId: string }) {
  return (
    <Container className={styles.container}>
      <Card className={styles.center}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="h5" mt={2} gutterBottom>
          Обрабатываем оплату...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Пожалуйста, подождите. Это может занять несколько минут.
        </Typography>

        <PaymentPollingClient sessionId={sessionId} />
      </Card>
    </Container>
  );
}
