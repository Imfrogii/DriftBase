"use client"

import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography } from "@mui/material"

interface CreateLocationDialogProps {
  open: boolean
  locationName: string
  selectedPosition: [number, number] | null
  onClose: () => void
  onLocationNameChange: (name: string) => void
  onCreate: () => void
}

export function CreateLocationDialog({
  open,
  locationName,
  selectedPosition,
  onClose,
  onLocationNameChange,
  onCreate,
}: CreateLocationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Location</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Location Name"
          fullWidth
          variant="outlined"
          value={locationName}
          onChange={(e) => onLocationNameChange(e.target.value)}
        />
        {selectedPosition && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Coordinates: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onCreate} variant="contained" disabled={!locationName.trim()}>
          Create Location
        </Button>
      </DialogActions>
    </Dialog>
  )
}
