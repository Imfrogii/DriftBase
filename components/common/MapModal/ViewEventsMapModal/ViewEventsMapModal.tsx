"use client";
import { BaseMapModal } from "../BaseMapModal";
import { useMapLogic } from "../useMapLogic";
import { Location, LocationWithEvents } from "@/lib/types/location";
import EventLocationSVG from "@/components/icons/EventLocationIcon";
import { useEventSearch } from "@/lib/hooks/useEventSearch";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, useMediaQuery } from "@mui/material";
import styles from "./ViewEventsMapModal.module.scss";
import {
  FiltersType,
  LeftHandFilters,
} from "../../LeftHandFilters/LeftHandFilters";
import { Close } from "@mui/icons-material";
import { BaseMapItem, MapMarkersType } from "../types";
import { DEFAULT_FILTERS } from "@/lib/helpers/filters";
import { SelectedLocationPopup } from "../../SelectedLocationPopup/SelectedLocationPopup";
import classNames from "classnames";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { getLatLng } from "@/lib/helpers/geo";

// TODO Add clusters (https://github.com/khmm12/react-map-gl-supercluster)
export function ViewEventsMapModal({
  open,
  onClose,
  initialFilters = DEFAULT_FILTERS,
  initialSelectedLocation = null,
}: {
  open: boolean;
  onClose: (filters: FiltersType) => void;
  initialFilters?: FiltersType;
  initialSelectedLocation?: Location | null;
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialSelectedLocation
  );
  const { nearbyEvents, fetchEventsInBounds, error, loading } =
    useEventSearch();

  const [isMobileFiltersOpened, setIsMobileFiltersOpened] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  useEffect(() => {
    setSelectedLocation(initialSelectedLocation);
  }, [open]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const {
    mapRef,
    viewState,
    handleMove,
    handleMoveEnd,
    handleMapClick,
    handleMarkerClick,
    getLocations,
  } = useMapLogic({
    open,
    selectedLocation,
    setSelectedLocation,
    fetchLocationsInBounds: fetchEventsInBounds,
  });

  const handleApplyFilters = useCallback((newFilters: FiltersType) => {
    setFilters(newFilters);
    getLocations(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const items: BaseMapItem<LocationWithEvents>[] = useMemo(
    () => [
      ...nearbyEvents.map((ev) => ({
        id: `event-${ev.location_id}`,
        marker: <EventLocationSVG />,
        payload: ev,
        type: MapMarkersType.EVENT,
        selected:
          selectedLocation?.id === ev.location_id ||
          selectedLocation?.location_id === ev.location_id,
        ...getLatLng(ev.geom),
      })),
    ],
    [nearbyEvents, selectedLocation]
  );

  const renderSelectedLocationPopup = useCallback(
    (locationWithEvents: BaseMapItem<LocationWithEvents>) => {
      return <SelectedLocationPopup locationWithEvents={locationWithEvents} />;
    },
    []
  );

  return (
    <BaseMapModal
      isViewPage={true}
      open={open}
      onClose={() => onClose(filters)}
      title="Events Map"
      mapRef={mapRef}
      viewState={viewState}
      onMove={handleMove}
      onMoveEnd={handleMoveEnd}
      onLoad={handleMoveEnd}
      onMapClick={handleMapClick}
      items={items}
      onMarkerClick={handleMarkerClick}
      renderSelectedLocationPopup={renderSelectedLocationPopup}
      contentLayers={
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
            initialFilters={initialFilters}
            onApplyFilters={handleApplyFilters}
            onClearAllFilters={handleClearFilters}
            containerClassName={styles.leftHandFilters}
            onCloseClick={() => setIsMobileFiltersOpened(false)}
          />
        </Box>
      }
      Header={
        <Box className={styles.header}>
          <Button
            onClick={() => setIsMobileFiltersOpened(true)}
            className={styles.openFiltersButton}
            variant="contained"
            color="primary"
            type="button"
            startIcon={<FilterAltOutlinedIcon />}
            size="small"
          >
            Open Filters
          </Button>
          <Button
            onClick={() => onClose(filters)}
            className={styles.closeMapButton}
            variant="contained"
            type="button"
            startIcon={<Close />}
            size="small"
          >
            Close Map
          </Button>
        </Box>
      }
    />
  );
}
