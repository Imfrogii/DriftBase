"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Container, Paper, Button, Box, Typography } from "@mui/material";
import { useUpdateEvent } from "@/lib/queries/events";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import styles from "./EditEventPage.module.scss";
import {
  EventLevel,
  EventStatus,
  EventType,
  EventWithRegistrations,
  Location,
} from "@/lib/supabase/types";
import { jsonToFormData } from "@/lib/helpers/jsonToFormData";
import "react-datepicker/dist/react-datepicker.css";
import { useCreateEventSchema } from "@/components/forms/EventForm/useCreateEventSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { EventForm } from "@/components/forms/EventForm/EventForm";

export interface EditEventFormData {
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
  image_url?: string | null;
  isDeleteImg?: boolean;
}

type EditEventPageProps = {
  userId: string;
  event: EventWithRegistrations;
};

export function EditEventPage({ event, userId }: EditEventPageProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const updateEventMutation = useUpdateEvent();
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const schema = useCreateEventSchema();

  const {
    creator,
    registrations,
    created_at,
    updated_at,
    created_by,
    free_places,
    location,
    registered_drivers,
    ...rest
  } = event;

  const methods = useForm<EditEventFormData>({
    defaultValues: {
      ...rest,
      image: null,
    },
    resolver: yupResolver(schema),
  });

  const {
    formState: { isSubmitting },
    reset,
  } = methods;

  const onSubmit = async (data: EditEventFormData) => {
    setSubmitMessage(null);

    if (!userId) return;

    // TODO only specific fields should be editable
    try {
      const formData = jsonToFormData({
        ...data,
        created_by: userId,
        status: EventStatus.ACTIVE,
      });
      const res = await updateEventMutation.mutateAsync(formData);
      reset();
      router.push(`/${locale}/event/${res.event.slug}`);
    } catch (error) {
      console.log(error);
      setSubmitMessage({
        type: "error",
        text: "Failed to update event. Please try again.",
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
            <EventForm
              isEditPage={true}
              onSubmit={onSubmit}
              setIsFileLoading={setIsFileLoading}
              initialLocation={location}
              registeredDrivers={registered_drivers}
            >
              <Box className={styles.actions}>
                <Button
                  variant="text"
                  color="inherit"
                  className={styles.submitButton}
                  onClick={() => router.push(`/${locale}/event/${event.slug}`)}
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
                    : t("edit_event.form.submit")}
                </Button>
              </Box>
            </EventForm>
          </FormProvider>
        </Paper>
      </Container>
    </div>
  );
}
