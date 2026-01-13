"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegistrationStatus } from "@/lib/supabase/types";
import api from "@/lib/utils/request";

const INITIAL_DELAY = 3000; // first check in 3 sek
const MAX_DELAY = 30000; // maximum 30 seconds between checks

export default function PaymentPollingClient({
  sessionId,
}: {
  sessionId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const poll = async (delay: number = INITIAL_DELAY) => {
      if (!isMounted) return;

      const { data } = await api.get<{ status: RegistrationStatus }>(
        `/api/payment/status/${sessionId}`
      );

      if (data.status === RegistrationStatus.PAYMENT_INITIATED) {
        const nextDelay = Math.min(delay * 1.5, MAX_DELAY);
        timeoutId = setTimeout(() => poll(nextDelay), delay);
        return;
      }

      router.refresh();
    };

    timeoutId = setTimeout(() => poll(), INITIAL_DELAY);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionId, router]);

  return null;
}
