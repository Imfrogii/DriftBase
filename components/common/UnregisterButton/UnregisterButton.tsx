"use client";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useUnregister } from "@/lib/queries/registrations";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

export function UnregisterButton({
  registrationId,
}: {
  registrationId: string;
}) {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const unregisterMutation = useUnregister(handleClose);

  const handleDestruction = () => {
    unregisterMutation.mutate(registrationId);
  };

  return (
    <>
      <Button
        color="secondary"
        variant="contained"
        startIcon={<PersonRemoveIcon />}
        onClick={handleOpen}
      >
        Unregister
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby={"Cancel Registration"}
        aria-describedby={"Cancel Registration"}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to cancel your registration?
        </DialogTitle>
        <DialogContent>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>No, keep it</Button>
          <Button
            onClick={handleDestruction}
            color="secondary"
            variant="contained"
          >
            Yes, unregister
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
