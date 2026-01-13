"use client";
import {
  FormControl,
  TextField,
  Paper,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { useTranslations } from "next-intl";
import styles from "./LeftHandFilters.module.scss";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomizedSlider from "../Slider/Slider";
import classNames from "classnames";
import { format } from "date-fns";
import { Close } from "@mui/icons-material";
import {
  DEFAULT_FILTERS,
  freePlacesVariants,
  levelCheckboxes,
  typeCheckboxes,
} from "@/lib/helpers/filters";

export type FiltersType = {
  level: string[];
  type: string[];
  priceMin: string;
  priceMax: string;
  dateFrom: string;
  dateTo: string;
  freePlaces: string;
  page?: string;
};

type LeftHandFiltersProps = {
  onApplyFilters: (filters: FiltersType) => void;
  onClearAllFilters: () => void;
  initialFilters: FiltersType;
  containerClassName?: string;
  onCloseClick: () => void;
};

export function LeftHandFilters({
  onApplyFilters,
  onClearAllFilters,
  initialFilters,
  containerClassName,
  onCloseClick,
}: LeftHandFiltersProps) {
  const t = useTranslations("events");
  const isMobile = useMediaQuery("(max-width:768px)");
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: Array.isArray(prev[key])
        ? prev[key].includes(value)
          ? prev[key].filter((filter) => filter !== value)
          : [...prev[key], value]
        : value,
    }));
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    onClearAllFilters();
  };

  const hasActiveFilters =
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <Paper className={classNames(styles.filtersContainer, containerClassName)}>
      {isMobile && (
        <IconButton className={styles.closeButton}>
          <Close onClick={onCloseClick} />
        </IconButton>
      )}
      <Box className={styles.filtersGrid}>
        <Box className={styles.filterBlock}>
          <FormControl
            sx={{ m: 3 }}
            component="fieldset"
            className={styles.formControl}
          >
            <FormLabel component="legend">Level</FormLabel>
            <FormGroup>
              {levelCheckboxes.map((item) => (
                <FormControlLabel
                  key={item.value}
                  control={
                    <Checkbox
                      checked={filters.level.includes(item.value)}
                      onChange={() => updateFilter("level", item.value)}
                      name={item.value}
                    />
                  }
                  label={item.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Box>
        <Box className={styles.filterBlock}>
          <FormControl
            sx={{ m: 3 }}
            component="fieldset"
            className={styles.formControl}
          >
            <FormLabel component="legend">Type</FormLabel>
            <FormGroup>
              {typeCheckboxes.map((item) => (
                <FormControlLabel
                  key={item.value}
                  control={
                    <Checkbox
                      checked={filters.type.includes(item.value)}
                      onChange={() => updateFilter("type", item.value)}
                      name={item.value}
                    />
                  }
                  label={item.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Box>

        <Box className={styles.filterBlock}>
          <FormLabel component="legend">Date Range</FormLabel>
          <DatePicker
            onChange={(values) => {
              updateFilter(
                "dateFrom",
                values[0] ? format(values[0], "yyyy-MM-dd'T'HH:mm:ss.SSS") : ""
              );
              updateFilter(
                "dateTo",
                values[1] ? format(values[1], "yyyy-MM-dd'T'HH:mm:ss.SSS") : ""
              );
            }}
            startDate={filters.dateFrom ? new Date(filters.dateFrom) : null}
            endDate={filters.dateTo ? new Date(filters.dateTo) : null}
            selectsRange
            wrapperClassName={styles.datePickerWrapper}
            popperClassName={styles.datePickerPopper}
            minDate={new Date()}
            placeholderText="Select date range"
            customInput={
              <TextField
                fullWidth
                size="small"
                disabled={true}
                value={filters.dateFrom}
                className={styles.datePickerInput}
              />
            }
            isClearable={true}
            calendarStartDay={1}
          />
        </Box>

        <Box className={styles.filterBlock}>
          <FormLabel component="legend">Price Range (PLN)</FormLabel>
          <CustomizedSlider
            initialValues={[filters.priceMin, filters.priceMax]}
            updateFilter={updateFilter}
          />
        </Box>

        <Box className={classNames(styles.filterBlock, styles.noBorder)}>
          <FormControl
            sx={{ m: 3 }}
            component="fieldset"
            className={styles.formControl}
          >
            <FormLabel component="legend">Availability</FormLabel>
            <FormGroup>
              {freePlacesVariants.map((item) => (
                <FormControlLabel
                  key={item.value}
                  control={
                    <Radio
                      checked={filters.freePlaces === item.value}
                      onChange={() => updateFilter("freePlaces", item.value)}
                      name={item.value}
                    />
                  }
                  label={item.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Box>
      </Box>

      <Box className={styles.buttonBox}>
        <Button
          variant="outlined"
          onClick={clearAllFilters}
          fullWidth
          disabled={!hasActiveFilters}
        >
          Clear
        </Button>
        <Button
          variant="contained"
          onClick={() => onApplyFilters(filters)}
          fullWidth
        >
          Filter Events
        </Button>
      </Box>
    </Paper>
  );
}
