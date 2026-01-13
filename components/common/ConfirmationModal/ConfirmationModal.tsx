import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
} from "@mui/material";

type ConfirmationModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  closeText: string;
  confirmText: string;
  ariaLabelledBy?: string;
};

export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  ariaLabelledBy,
  title,
  description,
  closeText,
  confirmText,
}: ConfirmationModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaLabelledBy}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {description}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{closeText}</Button>
        <Button onClick={onConfirm} color="secondary" variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
