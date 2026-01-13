"use client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Grid,
  Button,
  Box,
} from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import styles from "./EventsFilters.module.scss";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  DEFAULT_FILTERS,
  levelCheckboxes,
  parseFilters,
  SearchParamsFilters,
  typeCheckboxes,
} from "@/lib/helpers/filters";

interface EventsFiltersProps {
  searchParams?: SearchParamsFilters & {
    page?: string;
  };
  isHomePage?: boolean;
}

export function EventsFilters({ isHomePage }: EventsFiltersProps) {
  const t = useTranslations("events");
  const locale = useLocale();
  const router = useRouter();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const updateFilter = (key: string, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = parseFilters(filters);

    params.delete("page");

    const link = `/${locale}/events?${params.toString()}`;
    isHomePage ? router.push(link) : router.replace(link);
  };

  return (
    <Paper className={styles.filtersContainer} elevation={1}>
      <Box className={styles.filtersGrid}>
        <Box className={styles.filterItem}>
          <FormControl fullWidth size="small">
            <InputLabel>Level</InputLabel>
            <Select
              value={filters.level || ""}
              label="Level"
              onChange={(e) => updateFilter("level", e.target.value)}
            >
              <MenuItem value="">All Levels</MenuItem>
              {levelCheckboxes.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box className={styles.filterItem}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type || ""}
              label="Type"
              onChange={(e) => updateFilter("type", e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {typeCheckboxes.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box className={styles.filterItem}>
          <TextField
            fullWidth
            size="small"
            label="Max Price (PLN)"
            type="number"
            value={filters.priceMax || ""}
            onChange={(e) => updateFilter("priceMax", e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Box>

        <Box className={styles.filterItem}>
          <DatePicker
            onChange={(values) => {
              updateFilter("dateFrom", values[0]?.toISOString() || "");
              updateFilter("dateTo", values[1]?.toISOString() || "");
            }}
            startDate={filters.dateFrom ? new Date(filters.dateFrom) : null}
            endDate={filters.dateTo ? new Date(filters.dateTo) : null}
            selectsRange
            minDate={new Date()}
            wrapperClassName={styles.datePicker}
            popperClassName={styles.datePickerPopper}
            customInput={
              <TextField
                fullWidth
                size="small"
                label={t("filters.dateRange")}
                disabled={true}
                value={filters.dateFrom}
                className={styles.datePickerInput}
              />
            }
            isClearable={true}
            className={styles.datePicker}
            calendarStartDay={1}
          />
        </Box>
        <Box className={styles.button}>
          <Button variant="contained" onClick={applyFilters}>
            Apply filters
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
