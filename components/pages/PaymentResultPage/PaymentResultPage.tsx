import { PaymentError } from "@/components/common/PaymentResult/PaymentError";
import { PaymentPending } from "@/components/common/PaymentResult/PaymentPending";
import PaymentSuccessClient from "@/components/common/PaymentResult/PaymentSuccessClient";
import { getPaymentStatus } from "@/lib/api/payments";
import { RegistrationStatus } from "@/lib/supabase/types";

interface PageProps {
  searchParams: {
    session_id?: string;
    redirect?: string;
    canceled?: string;
  };
}

export default async function PaymentResultPage({ searchParams }: PageProps) {
  const sessionId = searchParams.session_id;
  const redirectUrl = searchParams.redirect
    ? decodeURIComponent(searchParams.redirect)
    : "/";
  const isCancelled = searchParams.canceled === "true";

  if (!sessionId || isCancelled) {
    return (
      <PaymentError
        redirectUrl={redirectUrl}
        message={
          isCancelled
            ? "Оплата была отменена"
            : "Отсутствует идентификатор сессии оплаты"
        }
      />
    );
  }

  try {
    const status = await getPaymentStatus(sessionId);

    if (status === RegistrationStatus.PAID) {
      return <PaymentSuccessClient redirectUrl={redirectUrl} />;
    }

    if (status === RegistrationStatus.PAYMENT_INITIATED) {
      return <PaymentPending sessionId={sessionId} />;
    }
  } catch (error) {
    return (
      <PaymentError
        redirectUrl={redirectUrl}
        message="Оплата не была завершена успешно"
      />
    );
  }

  return (
    <PaymentError
      redirectUrl={redirectUrl}
      message="Оплата не была завершена успешно"
    />
  );
}
