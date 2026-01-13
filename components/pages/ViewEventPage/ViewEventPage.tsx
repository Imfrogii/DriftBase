import { getEvent } from "@/lib/api/events";
import styles from "./ViewEventPage.module.scss";
import Image from "next/image";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CalendarToday,
  LocationOn,
  Person,
  PaymentsOutlined,
} from "@mui/icons-material";
import { format } from "date-fns";
import EventRegistrationForm from "@/components/forms/EventRegistrationForm/EventRegistrationForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import SmallMap from "@/components/common/SmallMap/SmallMap";
import { getImageUrl } from "@/lib/helpers/getImageUrl";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import { getLocale } from "next-intl/server";
import { CancelOrDeleteEventButton } from "@/components/common/CancelOrDeleteEventButton/CancelOrDeleteEventButton";
import { EventStatus } from "@/lib/supabase/types";
import classNames from "classnames";
import { UnregisterButton } from "@/components/common/UnregisterButton/UnregisterButton";
import CheckInCodeButton from "@/components/common/CheckInCodeButton/CheckInCodeButton";

type ViewEventPageProps = {
  id: string;
};

export default async function ViewEventPage({ id }: ViewEventPageProps) {
  const supabase = await createServerSupabaseClient();
  const locale = await getLocale();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const event = await getEvent(id);

  if (!event) {
    return (
      <Container
        maxWidth="lg"
        className={classNames(styles.fullEvent, styles.containerEmpty)}
      >
        <Box className={styles.emptyState}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Event Not Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            We've looked everywhere but couldn't find the event you're looking
            for
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href={`/${locale}/events`}
          >
            View All Events
          </Button>
        </Box>
      </Container>
    );
  }

  const infoItems = [
    {
      label: "Start Date:",
      value: format(new Date(event.start_date), "dd.MM.yyyy HH:mm"),
      icon: <CalendarToday fontSize="medium" />,
    },
    {
      label: "End Date:",
      value: format(new Date(event.end_date), "dd.MM.yyyy HH:mm"),
      icon: <CalendarToday fontSize="medium" />,
    },
    {
      label: "Location:",
      value: event.location?.name,
      icon: <LocationOn fontSize="medium" />,
    },
    {
      label: "Price:",
      value: `${event.price} PLN`,
      icon: <PaymentsOutlined fontSize="medium" />,
    },
    {
      label: "Registrations:",
      value: `${event.registrations?.length || 0} / ${event.max_drivers}`,
      icon: <Person fontSize="medium" />,
    },
  ];

  const registration = event.registrations?.find(
    (reg) => reg.user.id === user?.id
  );

  return (
    <div className={styles.fullEvent}>
      {event.status === EventStatus.CANCELLED && (
        <div className={styles.cancelOverlay}>
          <Alert severity="error" className={styles.alert} variant="standard">
            <Typography variant="body2" color="text.secondary">
              This event has been cancelled.
            </Typography>
          </Alert>
        </div>
      )}
      <div className={styles.imageContainer}>
        <div className={styles.overlay} />
        <Container maxWidth="lg" className={styles.headingContainer}>
          <Typography variant="h1" className={styles.heading}>
            {event.title}
          </Typography>
          <div className={styles.info}>
            {infoItems.map((item, index) => (
              <div className={styles.infoItem} key={index}>
                <Typography variant="body1">{item.label}</Typography>
                <div className={styles.infoValue}>
                  {item.icon}
                  <Typography variant="h6">{item.value}</Typography>
                </div>
              </div>
            ))}
          </div>
        </Container>

        {event.status === EventStatus.ACTIVE && (
          <div className={styles.actionButtons}>
            {registration?.id && (
              <div className={styles.button}>
                <CheckInCodeButton
                  variant="icon"
                  registrationId={registration?.id || ""}
                />
              </div>
            )}
            {event.created_by === user?.id && (
              <>
                <div className={styles.button}>
                  <Tooltip
                    title="Edit Event"
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
                    <IconButton
                      LinkComponent={Link}
                      href={`/${locale}/event/${id}/edit`}
                      aria-label="Edit Event"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                <div className={styles.button}>
                  <CancelOrDeleteEventButton
                    isDelete={!event.registrations.length}
                    eventId={event.id}
                    imageUrl={event.image_url}
                    redirectUrl={`/${locale}/events`}
                  />
                </div>
              </>
            )}
          </div>
        )}
        <Image
          // src={`/placeholder.svg?height=120&width=200&text=${encodeURIComponent(
          //   event.title
          // )}`}
          src={getImageUrl(event.image_url, event.status)}
          alt={event.title}
          className={styles.image}
          fill
        />
      </div>
      <Container maxWidth="lg" className={styles.container}>
        <Typography variant="body1" className={styles.description}>
          {event.description}
        </Typography>

        <Divider sx={{ my: 2 }} />
        <SmallMap selectedLocation={event.location} />
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Registered Participants ({event.registrations?.length || 0})
        </Typography>

        {event.registrations && event.registrations.length > 0 ? (
          <Box
            className={styles.participants}
            maxHeight={Math.max(50 * 15, 300)}
          >
            {event.registrations.map((registration) => (
              <Box key={registration.id} className={styles.participant}>
                <Typography variant="body2">
                  {registration.user.display_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {/* TODO displayed incorrect */}
                  {registration.car.name} · {registration.car.power} HP ·{" "}
                  {registration.car.level}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No participants yet.</Typography>
        )}
        <Divider sx={{ my: 2 }} />

        {/* Registration Form */}

        {registration ? (
          <Alert
            severity="success"
            className={styles.alert}
            classes={{ message: styles.message }}
            variant="outlined"
            action={<UnregisterButton registrationId={registration.id} />}
          >
            <Typography variant="body2" component="span">
              You are already registered for this event.
            </Typography>
            <Link href={`/${locale}/my-registrations`} className={styles.link}>
              <Typography variant="body2">View my registrations</Typography>
            </Link>
          </Alert>
        ) : (
          <EventRegistrationForm event={event} userId={user?.id} />
        )}
      </Container>
    </div>
  );
}
