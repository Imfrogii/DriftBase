"use client";

import { useMediaQuery } from "@mui/material";
import { SnackbarProvider as NotistackProvider } from "notistack";

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery("(max-width:768px)");

  return (
    <NotistackProvider
      maxSnack={3}
      autoHideDuration={3500}
      anchorOrigin={
        isMobile
          ? { vertical: "bottom", horizontal: "center" }
          : { vertical: "bottom", horizontal: "right" }
      }
      preventDuplicate
    >
      {children}
    </NotistackProvider>
  );
}
