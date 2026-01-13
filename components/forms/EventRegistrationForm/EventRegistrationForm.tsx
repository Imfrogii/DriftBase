"use client";

import { Grid, Typography, Alert, Button, Box } from "@mui/material";
import styles from "./EventRegistrationForm.module.scss";
import { useCars } from "@/lib/queries/cars";
import {
  useCreateCashRegistration,
  useCreateOnlineRegistration,
} from "@/lib/queries/registrations";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EventWithRegistrations, PaymentType } from "@/lib/supabase/types";
import CarSelector from "../CarSelector/CarSelector";
import Link from "next/link";
import { Add } from "@mui/icons-material";
import { UnregisterButton } from "@/components/common/UnregisterButton/UnregisterButton";
import { useSnackbar } from "notistack";

export interface RegisterFormData {
  car_id: string;
}

interface EventRegistrationFormProps {
  event: EventWithRegistrations;
  userId?: string;
}

export default function EventRegistrationForm({
  event,
  userId,
}: EventRegistrationFormProps) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const { data: cars, isLoading: carsLoading } = useCars({ enabled: !!userId });
  const { mutate, isPending } = useCreateCashRegistration();
  const onlineRegistration = useCreateOnlineRegistration();
  const methods = useForm<RegisterFormData>();

  const { handleSubmit } = methods;

  // if (carsLoading) {
  //   return null;
  // }

  if (!cars?.length || !userId) {
    return (
      <Alert
        severity="warning"
        className={styles.alert}
        classes={{ message: styles.message }}
        variant="outlined"
        action={
          <Button
            color="primary"
            variant="contained"
            component={Link}
            startIcon={<Add />}
            href={`/${locale}/profile?redirect=${encodeURIComponent(
              `/${locale}/events/${event.slug}`
            )}`}
          >
            Add Car
          </Button>
        }
      >
        <Typography variant="body2">
          You need to add at least one car to your profile before registering
          for events.
        </Typography>
      </Alert>
    );
  }

  const onSubmit = (data: RegisterFormData) => {
    if (!userId || !event) return;

    if (event.payment_type === PaymentType.ONLINE) {
      onlineRegistration.mutate({
        event_id: event.id,
        car_id: data.car_id,
      });
      return;
    }

    mutate({
      event_id: event.id,
      car_id: data.car_id,
    });
  };

  return (
    <Grid item xs={12} className={styles.registrationForm}>
      <Typography variant="h6" gutterBottom>
        Registration Details
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        className={styles.form}
      >
        <FormProvider {...methods}>
          <CarSelector cars={cars} />
        </FormProvider>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={isPending}
          className={styles.submitButton}
          fullWidth
        >
          {isPending ? "Registering..." : "Register for Event"}
        </Button>
      </Box>
    </Grid>
  );
}
