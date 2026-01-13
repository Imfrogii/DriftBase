"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Container, Paper, Button, Box, Typography } from "@mui/material";
import { useCreateEvent } from "@/lib/queries/events";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import styles from "./CreateEventPage.module.scss";
import { EventLevel, EventStatus, EventType } from "@/lib/supabase/types";
import { jsonToFormData } from "@/lib/helpers/jsonToFormData";
import { useCreateEventSchema } from "@/components/forms/EventForm/useCreateEventSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { EventForm } from "@/components/forms/EventForm/EventForm";
import "react-datepicker/dist/react-datepicker.css";

export interface CreateEventFormData {
  title: string;
  description: string;
  location_id: string;
  start_date: string;
  end_date: string;
  level: EventLevel;
  type: EventType;
  price: number;
  max_drivers: number;
  image: File | null;
}

type CreateEventPageProps = {
  userId: string;
};

export function CreateEventPage({ userId }: CreateEventPageProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const createEventMutation = useCreateEvent();
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const schema = useCreateEventSchema();
  const methods = useForm<CreateEventFormData>({
    defaultValues: {
      image: null,
    },
    resolver: yupResolver(schema),
  });

  if (!userId) {
    return null;
  }

  const {
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (data: CreateEventFormData) => {
    setSubmitMessage(null);

    if (!userId) return;

    try {
      const formData = jsonToFormData({
        ...data,
        created_by: userId,
        status: EventStatus.ACTIVE,
      });
      const res = await createEventMutation.mutateAsync(formData);
      reset();
      router.push(`/${locale}/event/${res.event.slug}`);
    } catch (error) {
      console.log(error);
      setSubmitMessage({
        type: "error",
        text: "Failed to create event. Please try again.",
      });
    }
  };

  return (
    <div className={styles.createEventPage}>
      <Container maxWidth="md" className={styles.container}>
        <Box className={styles.header}>
          <Typography variant="h2" gutterBottom>
            {t("create_event.title")}
          </Typography>
          <Typography variant="h5" gutterBottom>
            Fill in the details below to publish your drift event
          </Typography>
        </Box>

        <Paper className={styles.paper} elevation={1}>
          <FormProvider {...methods}>
            <EventForm onSubmit={onSubmit} setIsFileLoading={setIsFileLoading}>
              <Box className={styles.actions}>
                <Button
                  variant="text"
                  color="inherit"
                  className={styles.submitButton}
                  onClick={() => router.push(`/${locale}/events`)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || isFileLoading}
                  className={styles.submitButton}
                >
                  {isSubmitting
                    ? t("common.loading")
                    : t("create_event.form.submit")}
                </Button>
              </Box>
            </EventForm>
          </FormProvider>
        </Paper>
      </Container>
    </div>
  );
}
