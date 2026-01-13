// components/PaymentButton.tsx (по гайду: getStripe + redirectToCheckout)
"use client";

import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import getStripe from "@/lib/helpers/getStripe";
import { createClient } from "@/lib/supabase/client";

interface PaymentButtonProps {
  eventSlug: string;
  depositCents: number;
  eventTitle: string;
  organizerStripeId: string;
}

export default function PaymentButton({
  eventSlug,
  depositCents,
  eventTitle,
  organizerStripeId,
}: PaymentButtonProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // По гайду: fetchPostJSON — заменено на fetch
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          depositCents,
          eventTitle,
          organizerStripeId,
        }),
      });

      const { url, error } = await response.json();

      if (error) throw new Error(error);
      if (!url) throw new Error("No Checkout URL returned");
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Ошибка оплаты");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubmit}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={20} /> : null}
      variant="contained"
      color="primary"
    >
      {loading
        ? "Обрабатываем..."
        : `Записаться — депозит ${(depositCents / 100).toFixed(2)} zł`}
    </Button>
  );
}
