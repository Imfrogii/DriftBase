"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  Fab,
  CircularProgress,
} from "@mui/material";
import { MyLocation, Search } from "@mui/icons-material";
import L, { Map } from "leaflet";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useLocationPicker } from "@/lib/hooks/useLocationPicker";
import { useLocationSearch } from "@/lib/hooks/useLocationSearch";
import { useMapInteraction } from "@/lib/hooks/useMapInteraction";
import { LocationSearch } from "./LocationSearch";
import { MapEvents } from "./MapEvents";
import { MapMarkers } from "./MapMarkers/MapMarkers";
import { CreateLocationDialog } from "./CreateLocationDialog";
import type { Location } from "@/lib/types/location";
import styles from "./LocationPicker.module.scss";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

interface LocationPickerProps {
  initialLocation?: {
    name?: string;
    latitude: number;
    longitude: number;
  };
  onLocationSelect: (location: {
    name: string;
    latitude: number;
    longitude: number;
  }) => void;
  height?: number;
}

export function LocationPicker({
  initialLocation,
  onLocationSelect,
  height = 400,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const mapRef = useRef<Map>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Custom hooks
  const {
    mapCenter,
    mapZoom,
    selectedPosition,
    selectedLocationName,
    isInitialized,
    selectLocation,
    updateSelectedPosition,
    getCurrentLocation,
  } = useLocationPicker({ initialLocation, onLocationSelect });

  const {
    searchResults,
    nearbyLocations,
    loading,
    error,
    searchLocations,
    fetchLocationsInBounds,
    createLocation,
    clearSearchResults,
    clearError,
    cleanup,
  } = useLocationSearch();

  const {
    currentBounds,
    ghostPosition,
    showSearchButton,
    handleMapChange,
    handleMouseMove,
    handleMouseOut,
    markAsQueried,
  } = useMapInteraction();

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 0);
    }
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    searchLocations(debouncedSearchQuery);
  }, [debouncedSearchQuery, searchLocations]);

  // Initial load of locations
  useEffect(() => {
    if (!isInitialized || !currentBounds) return;

    if (currentBounds.zoom >= 5) {
      fetchLocationsInBounds(currentBounds);
      markAsQueried(currentBounds);
    }
  }, [isInitialized, fetchLocationsInBounds, markAsQueried]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Handle location selection from search
  const handleLocationSelect = useCallback(
    (location: Location) => {
      selectLocation({
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setSearchQuery("");
      clearSearchResults();
    },
    [selectLocation, clearSearchResults]
  );

  // Handle marker click
  const handleMarkerClick = useCallback(
    (location: Location) => {
      selectLocation({
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    },
    [selectLocation]
  );

  // Handle marker drag
  const handleMarkerDrag = useCallback(
    (e: L.DragEndEvent) => {
      const marker = e.target;
      const position = marker.getLatLng();
      updateSelectedPosition([position.lat, position.lng]);
    },
    [updateSelectedPosition]
  );

  // Handle map click
  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      updateSelectedPosition([e.latlng.lat, e.latlng.lng]);
      setCreateDialogOpen(true);
    },
    [updateSelectedPosition]
  );

  // Handle search button click
  const handleSearchThisArea = useCallback(() => {
    if (currentBounds) {
      fetchLocationsInBounds(currentBounds);
      markAsQueried(currentBounds);
    }
  }, [currentBounds, fetchLocationsInBounds, markAsQueried]);

  // Create new location
  const handleCreateLocation = useCallback(async () => {
    if (!selectedPosition || !newLocationName.trim()) return;

    try {
      const newLocation = await createLocation(
        newLocationName,
        selectedPosition[0],
        selectedPosition[1]
      );

      selectLocation({
        name: newLocation.name,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      });

      setCreateDialogOpen(false);
      setNewLocationName("");

      // Refresh locations if we have current bounds
      if (currentBounds && currentBounds.zoom >= 5) {
        fetchLocationsInBounds(currentBounds);
        markAsQueried(currentBounds);
      }
    } catch (error) {
      console.error("Error creating location:", error);
    }
  }, [
    selectedPosition,
    newLocationName,
    createLocation,
    selectLocation,
    currentBounds,
    fetchLocationsInBounds,
    markAsQueried,
  ]);

  // Get current location
  const handleGetCurrentLocation = useCallback(async () => {
    try {
      await getCurrentLocation();
    } catch (error: any) {
      console.error("Error getting current location:", error);
    }
  }, [getCurrentLocation]);

  if (!isInitialized) {
    return (
      <Box className={styles.locationPicker} style={{ height }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.locationPicker}>
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Controls */}
      <Box className={styles.controls}>
        <LocationSearch
          searchQuery={searchQuery}
          searchResults={searchResults}
          loading={loading}
          onSearchChange={setSearchQuery}
          onLocationSelect={handleLocationSelect}
        />

        <Button
          variant="outlined"
          startIcon={<MyLocation />}
          onClick={handleGetCurrentLocation}
          size="small"
        >
          My Location
        </Button>
      </Box>

      {/* Selected Location Info */}
      {selectedPosition && (
        <Paper className={styles.selectedLocation}>
          <Typography variant="body2">
            <strong>Selected:</strong>{" "}
            {selectedLocationName || "Custom Location"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
          </Typography>
        </Paper>
      )}

      {/* Map */}
      <Box className={styles.mapContainer} style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEvents
            onMapChange={handleMapChange}
            onMouseMove={handleMouseMove}
            onMouseOut={handleMouseOut}
            onClick={handleMapClick}
          />

          <MapMarkers
            nearbyLocations={nearbyLocations}
            selectedPosition={selectedPosition}
            ghostPosition={ghostPosition}
            onMarkerClick={handleMarkerClick}
            onMarkerDrag={handleMarkerDrag}
          />
        </MapContainer>

        {/* Search This Area Button */}
        {showSearchButton && (
          <Fab
            color="primary"
            variant="extended"
            size="medium"
            className={styles.searchButton}
            onClick={handleSearchThisArea}
            disabled={loading}
          >
            <Search sx={{ mr: 1 }} />
            {loading ? "Searching..." : "Search this area"}
          </Fab>
        )}
      </Box>

      {/* Create Location Dialog */}
      <CreateLocationDialog
        open={createDialogOpen}
        locationName={newLocationName}
        selectedPosition={selectedPosition}
        onClose={() => setCreateDialogOpen(false)}
        onLocationNameChange={setNewLocationName}
        onCreate={handleCreateLocation}
      />
    </Box>
  );
}
