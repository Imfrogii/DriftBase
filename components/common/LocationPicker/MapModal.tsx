"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Fab,
  TextField,
  Alert,
} from "@mui/material"
import { Close, MyLocation, Add } from "@mui/icons-material"
import Map, { Marker, NavigationControl, GeolocateControl } from "react-map-gl/maplibre"
import type { MapRef, ViewState } from "react-map-gl/maplibre"
import { useDeviceDetection } from "@/lib/hooks/useDeviceDetection"
import { useLocationSearch } from "@/lib/hooks/useLocationSearch"
import type { Location } from "@/lib/types/location"
import styles from "./MapModal.module.scss"

interface MapModalProps {
  open: boolean
  onClose: () => void
  selectedLocation: Location | null
  onLocationSelect: (location: Location) => void
}

const INITIAL_VIEW_STATE = {
  longitude: 21.0122,
  latitude: 52.2297,
  zoom: 10,
}

export function MapModal({ open, onClose, selectedLocation, onLocationSelect }: MapModalProps) {
  const mapRef = useRef<MapRef>(null)
  const { isTouchDevice } = useDeviceDetection()

  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE)
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)
  const [centerPosition, setCenterPosition] = useState<[number, number]>([52.2297, 21.0122])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newLocationName, setNewLocationName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const { nearbyLocations, fetchLocationsInBounds, createLocation, error, clearError } = useLocationSearch()

  // Initialize map position based on selected location
  useEffect(() => {
    if (open && selectedLocation) {
      const newViewState = {
        longitude: selectedLocation.longitude,
        latitude: selectedLocation.latitude,
        zoom: 15,
      }
      setViewState(newViewState)
      setMarkerPosition([selectedLocation.latitude, selectedLocation.longitude])
      setCenterPosition([selectedLocation.latitude, selectedLocation.longitude])
    } else if (open) {
      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const newViewState = {
              longitude,
              latitude,
              zoom: 12,
            }
            setViewState(newViewState)
            setCenterPosition([latitude, longitude])
          },
          () => {
            // Fallback to default location
            setCenterPosition([52.2297, 21.0122])
          },
        )
      }
    }
  }, [open, selectedLocation])

  // Update center position when map moves (for touch devices)
  const handleMove = useCallback(
    (evt: { viewState: ViewState }) => {
      setViewState(evt.viewState)
      if (isTouchDevice) {
        setCenterPosition([evt.viewState.latitude, evt.viewState.longitude])
      }
    },
    [isTouchDevice],
  )

  // Fetch nearby locations when map bounds change
  const handleMoveEnd = useCallback(() => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    const bounds = map.getBounds()

    if (viewState.zoom >= 8) {
      fetchLocationsInBounds({
        center: { lat: viewState.latitude, lng: viewState.longitude },
        bounds: {
          getNorth: () => bounds.getNorth(),
          getSouth: () => bounds.getSouth(),
          getEast: () => bounds.getEast(),
          getWest: () => bounds.getWest(),
        } as any,
        zoom: viewState.zoom,
      })
    }
  }, [viewState, fetchLocationsInBounds])

  // Handle map click (desktop only)
  const handleMapClick = useCallback(
    (event: any) => {
      if (isTouchDevice) return // Disable click on touch devices

      const { lngLat } = event
      setMarkerPosition([lngLat.lat, lngLat.lng])
    },
    [isTouchDevice],
  )

  // Handle marker drag (desktop only)
  const handleMarkerDrag = useCallback(
    (event: any) => {
      if (isTouchDevice) return

      const { lngLat } = event
      setMarkerPosition([lngLat.lat, lngLat.lng])
    },
    [isTouchDevice],
  )

  // Handle existing location marker click
  const handleLocationMarkerClick = useCallback(
    (location: Location) => {
      onLocationSelect(location)
      onClose()
    },
    [onLocationSelect, onClose],
  )

  // Handle create location
  const handleCreateLocation = useCallback(async () => {
    if (!newLocationName.trim()) return

    const position = isTouchDevice ? centerPosition : markerPosition
    if (!position) return

    setIsCreating(true)
    try {
      const newLocation = await createLocation(newLocationName, position[0], position[1])
      onLocationSelect(newLocation)
      onClose()
    } catch (error) {
      console.error("Failed to create location:", error)
    } finally {
      setIsCreating(false)
      setShowCreateDialog(false)
      setNewLocationName("")
    }
  }, [newLocationName, isTouchDevice, centerPosition, markerPosition, createLocation, onLocationSelect, onClose])

  // Handle confirm selection
  const handleConfirmSelection = useCallback(() => {
    const position = isTouchDevice ? centerPosition : markerPosition
    if (!position) return

    setNewLocationName("")
    setShowCreateDialog(true)
  }, [isTouchDevice, centerPosition, markerPosition])

  const currentPosition = isTouchDevice ? centerPosition : markerPosition

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: { m: 0 },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography variant="h6">Select Event Location</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: "relative", flex: 1 }}>
        {error && (
          <Alert
            severity="error"
            onClose={clearError}
            sx={{ position: "absolute", top: 16, left: 16, right: 16, zIndex: 1000 }}
          >
            {error}
          </Alert>
        )}

        <Map
          ref={mapRef}
          {...viewState}
          onMove={handleMove}
          onMoveEnd={handleMoveEnd}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        >
          <NavigationControl position="top-right" />
          <GeolocateControl position="top-right" />

          {/* Existing location markers */}
          {nearbyLocations.map((location) => (
            <Marker
              key={location.id}
              longitude={location.longitude}
              latitude={location.latitude}
              onClick={() => handleLocationMarkerClick(location)}
            >
              <Box className={styles.existingMarker}>
                <Box className={styles.markerDot} />
              </Box>
            </Marker>
          ))}

          {/* Selected/draggable marker (desktop only) */}
          {!isTouchDevice && markerPosition && (
            <Marker longitude={markerPosition[1]} latitude={markerPosition[0]} draggable onDrag={handleMarkerDrag}>
              <Box className={styles.selectedMarker}>
                <Box className={styles.markerPin} />
              </Box>
            </Marker>
          )}
        </Map>

        {/* Fixed center marker for touch devices */}
        {isTouchDevice && (
          <Box className={styles.centerMarker}>
            <Box className={styles.centerPin} />
          </Box>
        )}

        {/* Instructions */}
        <Box className={styles.instructions}>
          <Typography variant="body2" color="text.secondary">
            {isTouchDevice
              ? "Move the map to position the center marker, then tap 'Select Location'"
              : "Click on the map or drag the marker to select a location"}
          </Typography>
        </Box>

        {/* Current location button */}
        <Fab
          color="primary"
          size="small"
          className={styles.locationButton}
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords
                setViewState((prev) => ({
                  ...prev,
                  latitude,
                  longitude,
                  zoom: 15,
                }))
                if (!isTouchDevice) {
                  setMarkerPosition([latitude, longitude])
                }
              })
            }
          }}
        >
          <MyLocation />
        </Fab>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>

        <Button onClick={handleConfirmSelection} variant="contained" disabled={!currentPosition} startIcon={<Add />}>
          Select Location
        </Button>
      </DialogActions>

      {/* Create Location Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
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
          {currentPosition && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Coordinates: {currentPosition[0].toFixed(6)}, {currentPosition[1].toFixed(6)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateLocation} variant="contained" disabled={!newLocationName.trim() || isCreating}>
            {isCreating ? "Creating..." : "Create Location"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  )
}
