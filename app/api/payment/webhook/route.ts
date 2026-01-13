// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/helpers/stripe";
import { RegistrationStatus } from "@/lib/supabase/types";

// Важно: отключаем bodyParser, чтобы получить raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  // Получаем raw тело (для проверки подписи)
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Подключаем Supabase (с куками)
  const supabase = await createServerSupabaseClient();

  console.log(`Received Stripe event: ${event.type}`);

  // Обрабатываем событие
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { eventId, userId } = session.metadata || {};

    if (!eventId || !userId) {
      console.warn("Missing metadata in session:", session.id);
      return NextResponse.json({ received: true });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!paymentIntentId) {
      console.warn("Missing payment_intent in session:", session.id);
      return NextResponse.json({ received: true });
    }

    const { error } = await supabase
      .from("registrations")
      .update({
        status: RegistrationStatus.PAID,
        payment_intent_id: paymentIntentId,
      })
      .eq("stripe_session_id", session.id)
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .eq("status", RegistrationStatus.PAYMENT_INITIATED);

    if (error) {
      console.error("Supabase update error:", error);
    }
  }

  // if (event.type === "checkout.session.async_payment_succeeded") {
  //   const session = event.data.object;
  //   const { eventId, userId } = session.metadata || {};

  //   if (!eventId || !userId) {
  //     console.warn("Missing metadata in session:", session.id);
  //     return NextResponse.json({ received: true });
  //   }

  //   const { error } = await supabase
  //     .from("registrations")
  //     .update({
  //       status: RegistrationStatus.PAID,
  //     })
  //     .eq("stripe_session_id", session.id)
  //     .eq("user_id", userId)
  //     .eq("event_id", eventId)
  //     .eq("status", RegistrationStatus.PAYMENT_INITIATED);

  //   if (error) {
  //     console.error("Supabase update error:", error);
  //   }
  // }

  // if (event.type === "payment_intent.succeeded") {
  //   const paymentIntent = event.data.object;
  //   const { eventId, userId } = paymentIntent.metadata || {};

  //   if (eventId && userId) {
  //     const { error } = await supabase
  //       .from("registrations")
  //       .update({
  //         status: RegistrationStatus.PAID,
  //       })
  //       .eq("stripe_payment_intent_id", paymentIntent.id)
  //       .eq("user_id", userId)
  //       .eq("event_id", eventId)
  //       .eq("status", RegistrationStatus.PAYMENT_INITIATED);

  //     if (error) {
  //       console.error(
  //         "Supabase update error for successful payment intent:",
  //         error
  //       );
  //     }
  //   }
  // }

  if (event.type === "checkout.session.async_payment_failed") {
    const failedSession = event.data.object;
    const { eventId: failId, userId: failUserId } =
      failedSession.metadata || {};

    if (failId && failUserId) {
      const { error } = await supabase
        .from("registrations")
        .update({
          status: RegistrationStatus.EXPIRED_NO_PAYMENT,
        })
        .eq("stripe_session_id", failedSession.id)
        .eq("user_id", failUserId)
        .eq("event_id", failId)
        .eq("status", RegistrationStatus.PAYMENT_INITIATED);

      if (error) {
        console.error(
          "Supabase update error for async payment failure:",
          error
        );
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const expiredSession = event.data.object;
    const { eventId: expId, userId: expUserId } = expiredSession.metadata || {};
    console.log("Processing expired session metadata", expiredSession.metadata);
    if (expId && expUserId) {
      const { error } = await supabase
        .from("registrations")
        .update({
          status: RegistrationStatus.EXPIRED_NO_PAYMENT,
        })
        .eq("stripe_session_id", expiredSession.id)
        .eq("user_id", expUserId)
        .eq("event_id", expId)
        .eq("status", RegistrationStatus.PAYMENT_INITIATED);

      if (error) {
        console.error("Supabase update error for expired session:", error);
      }
    }
  }

  if (event.type === "payment_intent.canceled") {
    const canceledIntent = event.data.object;
    const { eventId, userId } = canceledIntent.metadata || {};

    if (eventId && userId) {
      const { error } = await supabase
        .from("registrations")
        .update({
          status: RegistrationStatus.EXPIRED_NO_PAYMENT,
        })
        .eq("payment_intent_id", canceledIntent.id)
        .eq("user_id", userId)
        .eq("event_id", eventId)
        .eq("status", RegistrationStatus.PAYMENT_INITIATED);

      if (error) {
        console.error(
          "Supabase update error for canceled payment intent:",
          error
        );
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const { eventId: failId, userId: failUserId } =
      paymentIntent.metadata || {};

    if (failId && failUserId) {
      const { error } = await supabase
        .from("registrations")
        .update({
          status: RegistrationStatus.PAYMENT_FAILED,
        })
        .eq("payment_intent_id", paymentIntent.id)
        .eq("user_id", failUserId)
        .eq("event_id", failId)
        .eq("status", RegistrationStatus.PAYMENT_INITIATED);

      if (error) {
        console.error(
          "Supabase update error for failed payment intent:",
          error
        );
      }
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object; // Это Charge объект

    // Если payment_intent пришёл как объект (расширенный), берём id оттуда
    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntentId) {
      console.log("charge.refunded event without payment_intent, skipping");
      return;
    }

    // Проверяем, полностью ли возвращена сумма
    // const fullyRefunded = charge.refunded; // true, если весь charge возвращён
    // Или можно проверить: charge.amount_refunded === charge.amount

    const supabase = await createServerSupabaseClient();

    // Обновляем статус регистрации
    const { error } = await supabase
      .from("registrations")
      .update({
        status: RegistrationStatus.REFUNDED,
        // status: fullyRefunded
        //   ? RegistrationStatus.REFUNDED
        //   : RegistrationStatus.PARTIALLY_REFUNDED, // если хочешь различать частичный рефанд
      })
      .eq("payment_intent_id", paymentIntentId)
      .in("status", [
        RegistrationStatus.REFUND_INITIATED,
        RegistrationStatus.PAYMENT_INITIATED, // на случай, если рефанд прошёл быстро
        RegistrationStatus.PAID,
      ]);

    if (error) {
      if (error.code === "PGRST116") {
        // Нет записи (не нашли по PI)
        console.log(
          `No registration found for refunded payment_intent ${paymentIntentId}`
        );
      } else {
        console.error(
          `Supabase update error on charge.refunded for PI ${paymentIntentId}:`,
          error
        );
      }
      return;
    }
  }

  // Отвечаем Stripe
  return NextResponse.json({ received: true });
}
