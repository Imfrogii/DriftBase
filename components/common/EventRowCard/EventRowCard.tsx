import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { LocationOn, Person } from "@mui/icons-material";
import { EventStatus, type EventWithCreator } from "@/lib/supabase/types";
import styles from "./EventRowCard.module.scss";
import Image from "next/image";
import Link from "next/link";
import { formatDate, isSameDay } from "date-fns";
import { getImageUrl } from "@/lib/helpers/getImageUrl";
import classNames from "classnames";
import { EventCardActions } from "../EventCardActions/EventCardActions";

interface EventRowCardProps {
  event: EventWithCreator;
  isMyEventsPage?: boolean;
  isMyRegistrationsPage?: boolean;
  locale: string;
  t: (key: string) => string;
  registrationId?: string;
}

function EventRowCard({
  event,
  isMyEventsPage,
  isMyRegistrationsPage,
  locale,
  t,
  registrationId,
}: EventRowCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "success";
      case "street":
        return "warning";
      case "pro":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Link
      href={`/${locale}/event/${event.slug}`}
      aria-label={`Open ${event.title}`}
    >
      <Card className={styles.eventCard}>
        <div
          className={classNames(styles.imageContainer, {
            [styles.cancelled]: event.status === EventStatus.CANCELLED,
          })}
        >
          <Image
            src={getImageUrl(event.image_url, event.status)}
            alt={event.title}
            className={styles.eventImage}
            fill
          />
          <Chip
            label={event.level}
            color={getLevelColor(event.level)}
            size="small"
            className={styles.levelChip}
          />
        </div>
        <CardContent className={styles.cardContent}>
          <Box className={styles.eventRow}>
            <Box className={styles.eventInfo}>
              <Box
                className={classNames(styles.eventHeader, {
                  [styles.cancelled]: event.status === EventStatus.CANCELLED,
                })}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  className={styles.eventTitle}
                >
                  {event.title}
                </Typography>
                {event.status === EventStatus.CANCELLED ? (
                  <Typography
                    variant="h6"
                    color="secondary"
                    className={styles.eventPrice}
                  >
                    Cancelled
                  </Typography>
                ) : (
                  <Typography
                    variant="h6"
                    color="primary"
                    className={styles.eventPrice}
                  >
                    {event.price} PLN
                  </Typography>
                )}
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                className={classNames(styles.eventDescription, {
                  [styles.cancelled]: event.status === EventStatus.CANCELLED,
                })}
              >
                {event.description_short}
              </Typography>

              <Box
                className={classNames(styles.eventDetails, {
                  [styles.cancelled]: event.status === EventStatus.CANCELLED,
                })}
              >
                <Box className={styles.detailsRow}>
                  <Box className={styles.detail}>
                    <CalendarMonthIcon fontSize="small" />
                    {isSameDay(event.start_date, event.end_date) ? (
                      <Typography variant="body2" fontWeight="bold">
                        {formatDate(event.start_date, "dd MMMM yyyy")}
                      </Typography>
                    ) : (
                      <Typography variant="body2" fontWeight="bold">
                        {formatDate(event.start_date, "dd")}-
                        {formatDate(event.end_date, "dd MMMM yyyy")}
                      </Typography>
                    )}
                  </Box>

                  <Box className={styles.detail}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2" fontWeight="bold">
                      {formatDate(event.start_date, "HH:mm")}-
                      {formatDate(event.end_date, "HH:mm")}
                    </Typography>
                  </Box>

                  <Box className={styles.detail}>
                    <LocationOn fontSize="small" />
                    <Typography variant="body2">
                      {event.location?.name || "Location TBD"}
                    </Typography>
                  </Box>
                </Box>

                <Box className={styles.detailsRow}>
                  {event.creator?.display_name && (
                    <Box className={styles.detail}>
                      <Person fontSize="small" />
                      <Typography variant="body2">
                        {event.creator?.display_name}
                      </Typography>
                    </Box>
                  )}
                  {event.registered_drivers !== undefined && (
                    <Box className={styles.detail}>
                      <GroupIcon fontSize="small" />
                      <Typography variant="body2">
                        {event.registered_drivers}/{event.max_drivers}{" "}
                        registered
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              <EventCardActions
                status={event.status}
                slug={event.slug}
                locale={locale}
                isMyEventsPage={isMyEventsPage}
                registrationId={registrationId}
                isMyRegistrationsPage={isMyRegistrationsPage}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}

export default EventRowCard;
