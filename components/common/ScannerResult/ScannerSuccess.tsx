"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "@mui/icons-material";
import { Box, Button, Card, Container, Typography } from "@mui/material";
import styles from "./ScannerResult.module.scss";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ScannerSuccessClient({
  redirectUrl,
}: {
  redirectUrl: string;
}) {
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    if (countdown === 0) {
      router.replace(redirectUrl);
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, redirectUrl]);

  return (
    <Container className={styles.container}>
      <Card className={styles.center}>
        <CheckCircle color="success" fontSize="large" />
        <Typography variant="h5" gutterBottom>
          Верификация прошла успешно!
        </Typography>
        <Typography variant="body1" align="center" mb={"0.5rem"}>
          Вы зарегистрированы на ивент
        </Typography>

        <Typography
          variant="body2"
          gutterBottom
          color="text.secondary"
          mb="1.5rem"
        >
          Мы вернем вас на сканнер через {countdown} секунд...
        </Typography>
        <Button
          variant="outlined"
          size="large"
          component={Link}
          href={redirectUrl}
          className={styles.redirectButton}
        >
          Вернуться к сканнеру
        </Button>
      </Card>
    </Container>
  );
}
