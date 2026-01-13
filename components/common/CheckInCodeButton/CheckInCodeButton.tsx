"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { QRCodeSVG } from "qrcode.react";
import styles from "./CheckInCodeButton.module.scss";
import {
  RegistrationCode,
  useGenerateCheckInCode,
} from "@/lib/queries/registrations";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { formatDate } from "date-fns";

interface CheckInCodeDialogProps {
  variant?: "button" | "icon";
  registrationId: string;
}

export default function CheckInCodeButton({
  variant,
  registrationId,
}: CheckInCodeDialogProps) {
  const [open, setOpen] = useState(false);
  const [registrationCode, setRegistrationCode] =
    useState<RegistrationCode | null>(null);
  const generateCodeMutation = useGenerateCheckInCode(setRegistrationCode);

  const regenerateCode = () => {
    generateCodeMutation.mutate(registrationId);
  };

  useEffect(() => {
    if (open) {
      regenerateCode();
    }
  }, [open]);

  const qrValue = registrationCode?.registration_code
    ? `${process.env.NEXT_PUBLIC_URL}/scan?c=${registrationCode.registration_code}`
    : "";

  return (
    <>
      {variant === "icon" ? (
        <Tooltip
          title="Check-In Code"
          slotProps={{
            popper: {
              modifiers: [
                {
                  name: "offset",
                  options: {
                    offset: [0, -8],
                  },
                },
              ],
            },
          }}
        >
          <IconButton onClick={() => setOpen(true)} aria-label="Check-In Code">
            <QrCodeIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          startIcon={<QrCodeIcon />}
        >
          Check-In Code
        </Button>
      )}
      {open && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
          aria-labelledby="checkin-code-dialog-title"
          PaperProps={{
            className: styles.dialogPaper,
          }}
        >
          <DialogTitle id="checkin-code-dialog-title" className={styles.title}>
            Код для въезда
            <IconButton
              aria-label="close"
              onClick={() => setOpen(false)}
              className={styles.closeButton}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers className={styles.content}>
            {generateCodeMutation.isPending ? (
              <Box className={styles.loadingContainer}>
                <CircularProgress />
                <Typography variant="body1" mt={2} align="center">
                  Генерация кода...
                </Typography>
              </Box>
            ) : !registrationCode ? (
              <Typography
                variant="body1"
                color="text.secondary"
                align="center"
                margin={"auto"}
              >
                Нажмите кнопку снизу, чтобы сгенерировать код для въезда.
              </Typography>
            ) : (
              <>
                <Box className={styles.qrContainer}>
                  <QRCodeSVG
                    value={qrValue}
                    size={220}
                    level="M"
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </Box>

                <Typography
                  variant="body1"
                  className={styles.hint}
                  color="text.secondary"
                  align="center"
                >
                  Покажи QR или код организатору на въезде
                </Typography>

                <Typography
                  variant="caption"
                  align="center"
                  display="block"
                  color="text.secondary"
                  mb={1}
                >
                  Действителен до{" "}
                  {formatDate(registrationCode.expires_at, "dd.MM.yyyy HH:mm")}
                </Typography>

                <Box className={styles.codeContainer}>
                  {registrationCode.registration_code
                    .toString()
                    .split("")
                    .map((digit, index) => (
                      <Typography
                        key={index}
                        variant="h3"
                        className={styles.digit}
                      >
                        {digit}
                      </Typography>
                    ))}
                </Box>
              </>
            )}
          </DialogContent>

          <DialogActions className={styles.actions}>
            <Button
              onClick={regenerateCode}
              disabled={generateCodeMutation.isPending}
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
            >
              {registrationCode ? "Regenerate Code" : "Generate Code"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
