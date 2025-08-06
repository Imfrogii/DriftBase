"use client"

import React from "react"

import { useState } from "react"
import {
  TextField,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material"
import { Search, LocationOn, Map } from "@mui/icons-material"
import { useDebounce } from "@/lib/hooks/useDebounce"
import { useLocationSearch } from "@/lib/hooks/useLocationSearch"
import type { Location } from "@/lib/types/location"
import styles from "./LocationSearchInput.module.scss"

interface LocationSearchInputProps {
  selectedLocation: Location | null
  onLocationSelect: (location: Location) => void
  onMapOpen: () => void
}

export function LocationSearchInput({ selectedLocation, onLocationSelect, onMapOpen }: LocationSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showResults, setShowResults] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const { searchResults, loading, searchLocations, clearSearchResults } = useLocationSearch()

  // Search when debounced query changes
  React.useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchLocations(debouncedSearchQuery)
      setShowResults(true)
    } else {
      clearSearchResults()
      setShowResults(false)
    }
  }, [debouncedSearchQuery, searchLocations, clearSearchResults])

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location)
    setSearchQuery("")
    setShowResults(false)
    clearSearchResults()
  }

  const handleInputFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowResults(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowResults(false), 200)
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.inputRow}>
        <TextField
          fullWidth
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
            endAdornment: loading ? <CircularProgress size={20} /> : null,
          }}
          variant="outlined"
        />

        <Button variant="contained" startIcon={<Map />} onClick={onMapOpen} sx={{ ml: 2, minWidth: 140 }}>
          Set on map
        </Button>
      </Box>

      {/* Selected Location Display */}
      {selectedLocation && (
        <Paper className={styles.selectedLocation}>
          <Box className={styles.locationInfo}>
            <LocationOn color="primary" />
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {selectedLocation.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </Typography>
            </Box>
          </Box>
          <Chip label="Selected" color="primary" size="small" variant="outlined" />
        </Paper>
      )}

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <Paper className={styles.searchResults}>
          <List dense>
            {searchResults.map((location) => (
              <ListItem
                key={location.id}
                button
                onClick={() => handleLocationSelect(location)}
                className={styles.resultItem}
              >
                <LocationOn sx={{ mr: 2, color: "text.secondary" }} />
                <ListItemText
                  primary={location.name}
                  secondary={`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* No Results */}
      {showResults && searchQuery.trim() && searchResults.length === 0 && !loading && (
        <Paper className={styles.searchResults}>
          <Box className={styles.noResults}>
            <Typography variant="body2" color="text.secondary">
              No locations found. Use "Set on map" to create a new location.
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  )
}
