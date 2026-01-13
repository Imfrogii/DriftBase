"use client";
import { useLocationSearch } from "@/lib/hooks/useLocationSearch";
import { Add } from "@mui/icons-material";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { Marker } from "react-map-gl/maplibre";
import { useState, useCallback, useEffect } from "react";
import { BaseMapModal } from "../BaseMapModal";
import { useMapLogic } from "../useMapLogic";
import { Location } from "@/lib/types/location";
import SetLocationSVG from "@/components/icons/SetLocationIcon";
import EventLocationSVG from "@/components/icons/EventLocationIcon";
import styles from "./SelectLocationMapModal.module.scss";
import { MapboxLocation } from "../../LocationSearch/LocationSearch";
import axios from "axios";
import { BaseMapItem, MapMarkersType } from "../types";
import { getLatLng } from "@/lib/helpers/geo";
import { useReverseGeocode } from "@/lib/queries/locations";

export function SelectLocationModal({
  open,
  onClose,
  selectedLocation,
  setSelectedLocation,
}: {
  open: boolean;
  onClose: () => void;
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
}) {
  const {
    nearbyLocations,
    fetchLocationsInBounds,
    createLocation,
    error,
    clearError,
  } = useLocationSearch();

  const {
    mapRef,
    viewState,
    markerPosition,
    isTouchDevice,
    handleMove,
    handleMoveEnd,
    handleMapClick,
    handleMarkerDrag,
    handleMarkerClick,
    currentPosition,
    handleSelectOption,
  } = useMapLogic({
    open,
    selectedLocation,
    fetchLocationsInBounds,
    setSelectedLocation,
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: newLocation } = useReverseGeocode({
    lat: currentPosition ? currentPosition[0] : 0,
    lon: currentPosition ? currentPosition[1] : 0,
    enabled: showCreateDialog && !!currentPosition,
  });

  const items: BaseMapItem<Location>[] = nearbyLocations.map(
    (loc) => ({
      id: loc.id,
      marker: <EventLocationSVG />,
      selected: selectedLocation?.id === loc.id,
      payload: loc,
      type: MapMarkersType.LOCATION,
      ...getLatLng(loc.geom),
    }),
    [nearbyLocations, selectedLocation]
  );

  const handleConfirmSelection = useCallback(() => {
    if (!currentPosition) return;
    if (selectedLocation) {
      onClose();
      return;
    }
    setShowCreateDialog(true);
  }, [currentPosition, selectedLocation]);

  const handleCreate = useCallback(async () => {
    if (
      !currentPosition ||
      !newLocationName.trim() ||
      !newLocation?.full_address
    )
      return;

    setIsCreating(true);
    try {
      const created = await createLocation({
        name: newLocationName.trim(),
        latitude: currentPosition[0],
        longitude: currentPosition[1],
        address: newLocation?.full_address || "",
      });
      setSelectedLocation(created);
      onClose();
    } catch (err) {
      console.error("Create location failed", err);
    } finally {
      setIsCreating(false);
      setShowCreateDialog(false);
      setNewLocationName("");
    }
  }, [
    createLocation,
    currentPosition,
    newLocationName,
    setSelectedLocation,
    onClose,
    newLocation,
  ]);

  return (
    <>
      <BaseMapModal
        open={open}
        onClose={onClose}
        title="Select Event Location"
        mapRef={mapRef}
        viewState={viewState}
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        onLoad={handleMoveEnd}
        onMapClick={handleMapClick}
        items={items}
        onMarkerClick={handleMarkerClick}
        onSelectOption={handleSelectOption}
        mapLayers={
          // draggable marker (desktop)
          !isTouchDevice &&
          !selectedLocation &&
          markerPosition && (
            <Marker
              longitude={markerPosition[1]}
              latitude={markerPosition[0]}
              draggable
              onDrag={(e) => handleMarkerDrag(e)}
            >
              <SetLocationSVG />
            </Marker>
          )
        }
        contentLayers={
          <>
            {!selectedLocation && isTouchDevice && (
              <div className={styles.centerMarker}>
                <SetLocationSVG />
              </div>
            )}

            {/* Instructions */}
            <Box className={styles.instructions}>
              <Typography variant="body2" color="text.secondary">
                {isTouchDevice
                  ? "Move the map to position the center marker, then tap 'Select Location'"
                  : "Click on the map or drag the marker to select a location"}
              </Typography>
            </Box>
          </>
        }
        extraLayers={
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>

            <Button
              onClick={handleConfirmSelection}
              variant="contained"
              disabled={!currentPosition}
              startIcon={selectedLocation ? null : <Add />}
            >
              {selectedLocation ? "Select Location" : "Create New Location"}
            </Button>
          </DialogActions>
        }
        error={error}
        clearError={clearError}
      />

      {/* Create Location Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Location</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Location Name"
            fullWidth
            variant="outlined"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            placeholder="Enter a name for this location"
          />

          {newLocation && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {newLocation?.full_address}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newLocationName.trim() || isCreating || !newLocation}
          >
            {isCreating ? "Creating..." : "Create Location"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
