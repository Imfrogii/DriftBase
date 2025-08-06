"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Container, Typography, Tabs, Tab, Box } from "@mui/material"
import { EventFilters } from "@/components/common/EventFilters/EventFilters"
import { EventCard } from "@/components/common/EventCard/EventCard"
import { EventMap } from "@/components/common/EventMap/EventMap"
import styles from "./HomePage.module.scss"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

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
  )
}

export function HomePage() {
  const t = useTranslations()
  const [tabValue, setTabValue] = useState(0)
  const [filters, setFilters] = useState({
    level: "",
    priceRange: [0, 1000],
    dateRange: { start: null, end: null },
  })

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Mock events data
  const mockEvents = [
    {
      id: "1",
      title: "Warsaw Drift Championship",
      date: "2024-02-15",
      location: { lat: 52.2297, lng: 21.0122, name: "Warsaw, Poland" },
      level: "pro",
      price: 150,
      description: "Professional drift competition in Warsaw",
      status: "approved" as const,
    },
    {
      id: "2",
      title: "Beginner Drift Training",
      date: "2024-02-20",
      location: { lat: 50.0647, lng: 19.945, name: "Krakow, Poland" },
      level: "beginner",
      price: 50,
      description: "Learn the basics of drifting",
      status: "approved" as const,
    },
  ]

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
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="event view tabs">
            <Tab label={t("home.tabs.list")} />
            <Tab label={t("home.tabs.map")} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <div className={styles.eventsList}>
              {mockEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <div className={styles.mapContainer}>
              <EventMap events={mockEvents} />
            </div>
          </TabPanel>
        </div>
      </Container>
    </div>
  )
}
