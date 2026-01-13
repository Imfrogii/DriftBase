"use client";
import { IconButton, Tooltip } from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { useCancelEvent, useDeleteEvent } from "@/lib/queries/events";
import { ConfirmationModal } from "../ConfirmationModal/ConfirmationModal";

export function CancelOrDeleteEventButton({
  isDelete,
  eventId,
  imageUrl,
  redirectUrl,
}: {
  isDelete?: boolean;
  eventId: string;
  imageUrl: string | null;
  redirectUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const deleteMutation = useDeleteEvent(redirectUrl);
  const cancelMutation = useCancelEvent(handleClose);

  const handleDestruction = () => {
    if (isDelete) {
      deleteMutation.mutateAsync({ eventId, image_url: imageUrl });
    } else {
      cancelMutation.mutateAsync({ eventId, image_url: imageUrl });
    }
  };

  return (
    <>
      <Tooltip
        title={isDelete ? "Delete Event" : "Cancel Event"}
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -8],
                },
              },
            ],
          },
        }}
      >
        <IconButton
          color="secondary"
          aria-label={isDelete ? "Delete Event" : "Cancel Event"}
          onClick={handleOpen}
        >
          {isDelete ? <DeleteIcon /> : <EventBusyIcon />}
        </IconButton>
      </Tooltip>

      {open && (
        <ConfirmationModal
          open={open}
          onClose={handleClose}
          onConfirm={handleDestruction}
          ariaLabelledBy={isDelete ? "delete-event" : "cancel-event"}
          title={`Are you sure you want to ${
            isDelete ? "delete" : "cancel"
          } this event?`}
          description="This action cannot be undone."
          closeText="No, keep it"
          confirmText={`Yes, ${isDelete ? "delete" : "cancel"}`}
        />
      )}
    </>
  );
}
