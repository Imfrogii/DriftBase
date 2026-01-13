import { Button, Container, Typography, Box, Card } from "@mui/material";
import Link from "next/link";
import styles from "./PromoMapSection.module.scss";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function PromoMapSection() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <section className={styles.wrapper}>
      <Container maxWidth="lg" className={styles.container}>
        <Card className={styles.card}>
          <Box className={styles.textContent}>
            <Typography variant="h3" component="h2" className={styles.title}>
              Discover events on the map
            </Typography>
            <Typography variant="body1" className={styles.subtitle}>
              Explore all upcoming automotive and drift events near you — find,
              join, and connect with other enthusiasts.
            </Typography>
            <Button
              component={Link}
              href={`/${locale}/events?mapView=true`}
              variant="contained"
              color="primary"
              size="large"
              className={styles.button}
            >
              Open map
            </Button>
          </Box>
          <Box className={styles.mapPreview} aria-hidden="true">
            <Image
              src="/mapPromo.webp"
              alt="map preview"
              fill
              quality={30}
              priority={false}
              className={styles.mapImage}
              loading="lazy"
            />
          </Box>
        </Card>
      </Container>
    </section>
  );
}
