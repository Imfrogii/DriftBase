"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { FormControl, InputLabel, Select, MenuItem, TextField, Paper, Grid, Button, Box } from "@mui/material"
import { useTranslations } from "next-intl"
import { FilterList, Clear } from "@mui/icons-material"
import styles from "./EventsFilters.module.scss"

interface EventsFiltersProps {
  searchParams: {
    level?: string
    priceMin?: string
    priceMax?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }
}

export function EventsFilters({ searchParams }: EventsFiltersProps) {
  const t = useTranslations("events")
  const router = useRouter()
  const currentSearchParams = useSearchParams()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset page when filters change
    params.delete('page')
    
    router.push(`/events?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/events')
  }

  const hasActiveFilters = Object.keys(searchParams).some(key => 
    key !== 'page' && searchParams[key as keyof typeof searchParams]
  )

  return (
    <Paper className={styles.filtersContainer} elevation={1}>
      <Box className={styles.filtersHeader}>
        <Box className={styles.filtersTitle}>
          <FilterList />
          <span>Filters</span>
        </Box>
        {hasActiveFilters && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Clear />}
            onClick={clearAllFilters}
            className={styles.clearButton}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Grid container spacing={2} className={styles.filtersGrid}>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Level</InputLabel>
            <Select
              value={searchParams.level || ""}
              label="Level"
              onChange={(e) => updateFilters("level", e.target.value)}
            >
              <MenuItem value="">All Levels</MenuItem>
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="street">Street</MenuItem>
              <MenuItem value="pro">Professional</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Min Price (PLN)"
            type="number"
            value={searchParams.priceMin || ""}
            onChange={(e) => updateFilters("priceMin", e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Max Price (PLN)"
            type="number"
            value={searchParams.priceMax || ""}
            onChange={(e) => updateFilters("priceMax", e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Date From"
            type="date"
            value={searchParams.dateFrom || ""}
            onChange={(e) => updateFilters("dateFrom", e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Date To"
            type="date"
            value={searchParams.dateTo || ""}
            onChange={(e) => updateFilters("dateTo", e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}
