"use client";

import type React from "react";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Container, Typography, Tabs, Tab, Box } from "@mui/material";
import { EventFilters } from "@/components/common/EventFilters/EventFilters";
import { EventCard } from "@/components/common/EventCard/EventCard";
import { EventMap } from "@/components/common/EventMap/EventMap";
import styles from "./HomePage.module.scss";
import { useEvents } from "@/lib/queries/events";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function HomePage() {
  const t = useTranslations();
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    level: "",
    priceRange: [0, 1000],
    dateRange: { start: null, end: null },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const { data, isLoading } = useEvents(filters);

  return (
    <div className={styles.homePage}>
      <Container maxWidth="xl">
        <div className={styles.header}>
          <Typography variant="h1" component="h1" className={styles.title}>
            {t("home.title")}
          </Typography>
          <Typography variant="h6" className={styles.subtitle}>
            {t("home.subtitle")}
          </Typography>
        </div>

        <div className={styles.filtersSection}>
          <EventFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        <div className={styles.contentSection}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="event view tabs"
          >
            <Tab label={t("home.tabs.list")} />
            <Tab label={t("home.tabs.map")} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <div className={styles.eventsList}>
              {data &&
                data.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <div className={styles.mapContainer}>
              <EventMap events={data ? data : []} />
            </div>
          </TabPanel>
        </div>
      </Container>
    </div>
  );
}
