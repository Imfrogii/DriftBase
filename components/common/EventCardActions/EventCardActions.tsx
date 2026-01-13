"use client";
import { EventStatus } from "@/lib/supabase/types";
import { Box, Button } from "@mui/material";
import styles from "./EventCardActions.module.scss";
import { useRouter } from "next/navigation";
import CheckInCodeButton from "../CheckInCodeButton/CheckInCodeButton";

type EventCardActionsProps = {
  status: EventStatus;
  isMyEventsPage?: boolean;
  isMyRegistrationsPage?: boolean;
  slug: string;
  locale: string;
  registrationId?: string;
};

export function EventCardActions({
  status,
  isMyEventsPage,
  isMyRegistrationsPage,
  slug,
  locale,
  registrationId,
}: EventCardActionsProps) {
  const router = useRouter();

  return (
    <Box className={styles.eventActions}>
      <Button variant="outlined" size="small" className={styles.actionButton}>
        View Details
      </Button>
      {status !== EventStatus.CANCELLED && (
        <Box
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {isMyEventsPage && (
            <Button
              variant="contained"
              size="small"
              className={styles.actionButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/${locale}/event/${slug}/edit`);
              }}
            >
              Edit
            </Button>
          )}
          {isMyRegistrationsPage && registrationId && (
            <CheckInCodeButton
              variant="button"
              registrationId={registrationId}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
