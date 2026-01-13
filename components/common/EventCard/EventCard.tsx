import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import { LocationOn, Person } from "@mui/icons-material";
import MoneyIcon from "@mui/icons-material/Paid";
import GroupIcon from "@mui/icons-material/Group";
import type { EventWithCreator } from "@/lib/supabase/types";
import { Button } from "../Button/Button";
import styles from "./EventCard.module.scss";
import Image from "next/image";
import { formatDate, isSameDay } from "date-fns";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getImageUrl } from "@/lib/helpers/getImageUrl";

interface EventCardProps {
  event: EventWithCreator;
  loading?: boolean;
}

export async function EventCard({ event }: EventCardProps) {
  const locale = await getLocale();
  const t = await getTranslations();

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
    <Link href={`/${locale}/event/${event.slug}`}>
      <Card className={styles.card}>
        <Image
          // src={`/placeholder.svg?height=120&width=200&text=${encodeURIComponent(
          //   event.title
          // )}`}
          src={getImageUrl(event.image_url, event.status)}
          alt={event.title}
          className={styles.eventImage}
          fill
        />
        <Chip
          label={t(`levels.${event.level}`)}
          color={getLevelColor(event.level)}
          size="small"
          className={styles.levelChip}
        />

        <CardContent>
          <Box className={styles.header}>
            <Typography variant="h6" component="h3" className={styles.title}>
              {event.title}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            className={styles.description}
          >
            {event.description_short}
          </Typography>

          <Box className={styles.details}>
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
              <Typography variant="body2">{event.location?.name}</Typography>
            </Box>

            <Box className={styles.detail}>
              <MoneyIcon fontSize="small" />
              <Typography variant="body2">{event.price} PLN</Typography>
            </Box>

            <Box className={styles.detail}>
              <Person fontSize="small" />
              <Typography variant="body2">
                {event.creator.display_name}
              </Typography>
            </Box>

            <Box className={styles.detail}>
              <GroupIcon fontSize="small" />
              <Typography variant="body2">
                {event.registered_drivers}/{event.max_drivers} registered
              </Typography>
            </Box>
          </Box>
        </CardContent>

        <CardActions className={styles.cardActions}>
          <Button
            variant="outlined"
            component="span"
            color="primary"
            fullWidth
            className={styles.button}
          >
            {t("View Details")}
          </Button>
        </CardActions>
      </Card>
    </Link>
  );
}
