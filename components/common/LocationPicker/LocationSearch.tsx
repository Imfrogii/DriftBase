"use client"

import { Autocomplete, TextField, CircularProgress, Typography, Box } from "@mui/material"
import type { Location } from "@/lib/types/location"

interface LocationSearchProps {
  searchQuery: string
  searchResults: Location[]
  loading: boolean
  onSearchChange: (query: string) => void
  onLocationSelect: (location: Location) => void
}

export function LocationSearch({
  searchQuery,
  searchResults,
  loading,
  onSearchChange,
  onLocationSelect,
}: LocationSearchProps) {
  return (
    <Autocomplete
      options={searchResults}
      getOptionLabel={(option) => option.name}
      inputValue={searchQuery}
      onInputChange={(_, newValue) => onSearchChange(newValue)}
      onChange={(_, value) => value && onLocationSelect(value)}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search locations"
          variant="outlined"
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Box>
            <Typography variant="body2">{option.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.latitude.toFixed(4)}, {option.longitude.toFixed(4)}
            </Typography>
          </Box>
        </li>
      )}
      sx={{ flexGrow: 1 }}
    />
  )
}
