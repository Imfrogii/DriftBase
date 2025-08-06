"use client"
import { FormControl, InputLabel, Select, MenuItem, TextField, Paper, Grid } from "@mui/material"
import { useTranslations } from "next-intl"
import styles from "./EventFilters.module.scss"

interface EventFiltersProps {
  filters: {
    level: string
    priceMin: string
    priceMax: string
    dateFrom: string
    dateTo: string
  }
  onFiltersChange: (filters: any) => void
}

export function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const t = useTranslations("events")

  const handleFilterChange = (field: string, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    })
  }

  return (
    <Paper className={styles.filtersContainer}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("filters.level")}</InputLabel>
            <Select
              value={filters.level}
              label={t("filters.level")}
              onChange={(e) => handleFilterChange("level", e.target.value)}
            >
              <MenuItem value="">{t("filters.allLevels")}</MenuItem>
              <MenuItem value="beginner">{t("levels.beginner")}</MenuItem>
              <MenuItem value="street">{t("levels.street")}</MenuItem>
              <MenuItem value="pro">{t("levels.pro")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            fullWidth
            size="small"
            label={t("filters.priceMin")}
            type="number"
            value={filters.priceMin}
            onChange={(e) => handleFilterChange("priceMin", e.target.value)}
            InputProps={{
              endAdornment: "PLN",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            fullWidth
            size="small"
            label={t("filters.priceMax")}
            type="number"
            value={filters.priceMax}
            onChange={(e) => handleFilterChange("priceMax", e.target.value)}
            InputProps={{
              endAdornment: "PLN",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            fullWidth
            size="small"
            label={t("filters.dateFrom")}
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            fullWidth
            size="small"
            label={t("filters.dateTo")}
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}
