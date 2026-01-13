"use client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Paper,
  Button,
  Box,
  Backdrop,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import styles from "./LeftHandFiltersWrapper.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import { ViewEventsMapModal } from "../MapModal/ViewEventsMapModal/ViewEventsMapModal";
import {
  FiltersType,
  LeftHandFilters,
} from "../LeftHandFilters/LeftHandFilters";
import {
  generateFiltersFromParams,
  parseFilters,
  SearchParamsFilters,
} from "@/lib/helpers/filters";
import classNames from "classnames";
// TODO check which way is preferable
import { MapOutlined } from "@mui/icons-material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

interface LeftHandFiltersProps {
  searchParams?: SearchParamsFilters & {
    page?: string;
  };
  isMapDefaultOpened?: boolean;
}

export function LeftHandFiltersWrapper({
  searchParams,
  isMapDefaultOpened = false,
}: LeftHandFiltersProps) {
  const t = useTranslations("events");
  const locale = useLocale();
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const theme = useTheme();

  const [isMapOpened, setIsMapOpened] = useState(isMapDefaultOpened);
  const [isMobileFiltersOpened, setIsMobileFiltersOpened] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    document.body.style.overflow = isMobileFiltersOpened ? "hidden" : "auto";
  }, [isMobileFiltersOpened]);

  useEffect(() => {
    setIsMobileFiltersOpened(false);
  }, [isMobile]);

  const initialFilters: FiltersType = useMemo(
    () => generateFiltersFromParams(searchParams),
    [searchParams]
  );

  const onApplyFilters = useCallback(
    (filters: FiltersType) => {
      const params = parseFilters(filters);

      params.delete("page");

      const link = `/${locale}/events?${params.toString()}`;
      router.replace(link);
    },
    [locale, router]
  );

  const onClearAllFilters = useCallback(() => {
    router.replace(`/${locale}/events`);
  }, [locale, router]);

  return (
    <>
      <Box className={styles.mobileLinks}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => setIsMobileFiltersOpened(true)}
          startIcon={<FilterAltOutlinedIcon />}
        >
          Open Filters
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => setIsMapOpened(true)}
          startIcon={<MapOutlined />}
        >
          Show on map
        </Button>
      </Box>
      <Paper className={styles.mapContainer}>
        <Box className={styles.textContent}>
          <Box className={styles.mapButtonWrapper}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              className={styles.button}
              onClick={() => setIsMapOpened(true)}
            >
              Open map
            </Button>
          </Box>
        </Box>
        <Box className={styles.mapPreview} aria-hidden="true">
          <Image
            src="/mapPromo.webp"
            alt="map preview"
            fill
            quality={50}
            priority={false}
            className={styles.mapImage}
            loading="lazy"
            sizes="300px"
          />
        </Box>
      </Paper>
      <Box className={styles.filtersWrapperContainer}>
        <Box
          className={classNames(styles.filtersContainer, {
            [styles.opened]: isMobileFiltersOpened,
          })}
        >
          {isMobile && isMobileFiltersOpened && (
            <Box
              onClick={() => setIsMobileFiltersOpened(false)}
              className={styles.backdrop}
            />
          )}
          <LeftHandFilters
            onApplyFilters={onApplyFilters}
            onClearAllFilters={onClearAllFilters}
            initialFilters={initialFilters}
            containerClassName={styles.filtersInnerContainer}
            onCloseClick={() => setIsMobileFiltersOpened(false)}
          />
        </Box>
      </Box>
      <ViewEventsMapModal
        open={isMapOpened}
        initialFilters={initialFilters}
        onClose={(filters) => {
          onApplyFilters(filters);
          setIsMapOpened(false);
        }}
      />
    </>
  );
}
