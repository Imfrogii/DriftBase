"use client";

import { useState, useEffect } from "react";
import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
import type { Location } from "@/lib/types/location";
import styles from "./LocationPicker.module.scss";
import { SelectLocationModal } from "../MapModal/SelectLocationMapModal/SelectLocationMapModal";
import { MapOutlined } from "@mui/icons-material";

interface LocationPickerProps {
  initialLocation?: Location | null;
  onLocationSelect: (locationId: string) => void;
  error?: string;
  disabled?: boolean;
}

export function LocationPicker({
  initialLocation,
  onLocationSelect,
  error,
  disabled,
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation ?? null
  );
  const [mapModalOpen, setMapModalOpen] = useState(false);

  useEffect(() => {
    selectedLocation && onLocationSelect(selectedLocation.id);
  }, [selectedLocation]);

  const handleMapOpen = () => {
    setMapModalOpen(true);
  };

  const handleMapClose = () => {
    setMapModalOpen(false);
  };

  return (
    <Box className={styles.locationPicker}>
      <Button
        variant="outlined"
        disabled={disabled}
        onClick={handleMapOpen}
        color="inherit"
        fullWidth
        sx={{
          justifyContent: "flex-start",
          borderColor: error ? "#d32f2f" : "rgba(0, 0, 0, 0.23)",
          color: error ? "#d32f2f" : "currentcolor",
        }}
        startIcon={<MapOutlined />}
      >
        {selectedLocation ? selectedLocation.name : "Choose location*"}
      </Button>

      {error && (
        <Typography variant="caption" color="error" marginX={"14px"}>
          {error}
        </Typography>
      )}

      <SelectLocationModal
        open={mapModalOpen}
        onClose={handleMapClose}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
    </Box>
  );
}
