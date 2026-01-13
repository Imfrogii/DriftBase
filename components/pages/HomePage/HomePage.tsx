import type React from "react";
import { Button, Container, Typography } from "@mui/material";
import { EventCard } from "@/components/common/EventCard/EventCard";
import styles from "./HomePage.module.scss";
import { getEvents } from "@/lib/api/events";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { EventsFilters } from "@/components/common/EventsFilters/EventsFilters";
import PromoMapSection from "@/components/common/PromoMapSection/PromoMapSection";
import Image from "next/image";
import { SortOrder } from "@/lib/helpers/filters";

export async function HomePage() {
  const t = await getTranslations();
  const locale = await getLocale();

  // TODO запрос отправляется с my-registrations страницы почему-то
  const data = await getEvents({
    size: 3,
    sortBy: "created_at",
    sortOrder: SortOrder.DESC,
  });

  return (
    <div className={styles.homePage}>
      <Container maxWidth={false} className={styles.mainContainer}>
        <Container maxWidth="lg" className={styles.container}>
          <div className={styles.imageContainer}>
            <Image
              src="homeHero2.png"
              alt="Home Hero"
              fill
              quality={30}
              priority={false}
              className={styles.heroImage}
              loading="lazy"
            />
          </div>
          <div className={styles.filtersSection}>
            <EventsFilters isHomePage={true} />
          </div>

          <div className={styles.header}>
            <Typography variant="h1" component="h1" className={styles.title}>
              Find your drift event
            </Typography>
            <Typography variant="h6" className={styles.subtitle}>
              Discover the best drifting opportunities near you
            </Typography>
            <Button
              component={Link}
              href={`/${locale}/events`}
              variant="contained"
              color="primary"
              size="large"
              className={styles.button}
            >
              View all events
            </Button>
          </div>
        </Container>
      </Container>

      <Container maxWidth="lg" className={styles.container}>
        <Typography variant="h3" className={styles.sectionTitle}>
          Newly created events
        </Typography>
        <div className={styles.contentSection}>
          <div className={styles.eventsList}>
            {data?.events &&
              data.events.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
          </div>
        </div>
        <PromoMapSection />
      </Container>
    </div>
  );
}
