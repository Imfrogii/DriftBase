"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Container,
} from "@mui/material";
import styles from "./CodeScannerPage.module.scss";
import { useRegistrationCodeCheck } from "@/lib/queries/registrations";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Html5QrcodeScanner } from "html5-qrcode";
import { enqueueSnackbar } from "notistack";
import { useCodeValidationSchema } from "./useCodeValidationSchema";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { getErrorTranslation } from "@/lib/helpers/getErrorTranslation";

export default function CodeScannerPage() {
  const t = useTranslations();
  const codeValidationSchema = useCodeValidationSchema();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<{ code: string }>({
    resolver: yupResolver(codeValidationSchema),
    defaultValues: { code: "" },
  });
  const [isScanLoading, setIsScanLoading] = useState(false);
  const registrationCodeCheckMutation = useRegistrationCodeCheck(
    reset,
    setIsScanLoading
  );

  const handleCheckIn = async ({ code }: { code: string }) => {
    try {
      await registrationCodeCheckMutation.mutateAsync(code.trim());
    } catch {}
  };

  // Настройка сканера
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1,
        disableFlip: false,
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        scanner.pause(true);
        setIsScanLoading(true);

        // Извлекаем код из URL вида /scan?c=483921
        console.log("Decoded URL:", decodedText);
        const url = new URL(decodedText);
        const code = url.searchParams.get("c");
        if (code) {
          handleCheckIn({ code }).finally(() => {
            setIsScanLoading(false);
            setTimeout(() => scanner.resume(), 1000);
          });
        } else {
          enqueueSnackbar("Некорректный код в QR", {
            variant: "error",
            autoHideDuration: 5000,
          });
          setIsScanLoading(false);
          setTimeout(() => scanner.resume(), 1000);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return (
    <Container maxWidth="md" className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h2" gutterBottom>
          Сканер кодов для въезда
        </Typography>
        <Typography variant="h5" gutterBottom>
          Scan the code or enter it manually to check in.
        </Typography>
      </Box>

      <Paper className={styles.paper} elevation={1}>
        {/* Камера */}
        <div id="reader" className={styles.reader} />

        {/* Ручной ввод */}
        <Box
          className={styles.manualInput}
          component="form"
          onSubmit={handleSubmit(handleCheckIn)}
        >
          <TextField
            {...register("code")}
            placeholder="______"
            label={t("scanner.codeField")}
            error={!!errors.code}
            helperText={errors.code?.message}
            inputProps={{
              maxLength: 6,
              style: {
                letterSpacing: "0.3rem",
              },
            }}
            disabled={isSubmitting || isScanLoading}
            className={styles.codeInput}
            autoComplete="off"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting || isScanLoading}
            className={styles.confirmButton}
          >
            {isSubmitting || isScanLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Подтвердить"
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
