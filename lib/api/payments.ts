"use server";

import { Stripe } from "stripe";
import { stripe } from "../helpers/stripe";
import { createServerSupabaseClient } from "../supabase/server";
import { PaymentType, RegistrationStatus } from "../supabase/types";
import { handleCommonError } from "../helpers/errors";
import {
  calculatePlatformFeeAmount,
  calculateRefundAmount,
} from "../helpers/payment";

export async function getPaymentStatus(sessionId: string) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("registrations")
      .select("status")
      .eq("stripe_session_id", sessionId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data?.status;
  } catch (error) {
    throw error;
  }
}

export async function handleSuccessfulPayment(sessionId: string) {
  const supabase = await createServerSupabaseClient();

  await supabase
    .from("registrations")
    .update({ status: RegistrationStatus.PAID })
    .eq("stripe_session_id", sessionId)
    .throwOnError();
}

export async function createPaymentSession({
  price,
  stripe_account_id,
  organizer_id,
  event_slug,
  event_id,
  car_id,
  locale,
  url,
  payer_user_id,
  payer_email,
}: {
  price: number;
  stripe_account_id: string;
  organizer_id: string;
  event_slug: string;
  event_id: string;
  car_id: string;
  locale: Stripe.Checkout.SessionCreateParams.Locale;
  url: string;
  payer_user_id: string;
  payer_email: string;
}) {
  const supabase = await createServerSupabaseClient();
  const redirectUrl = `/${locale}/event/${event_slug}`;
  const params: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card", "blik", "p24"],
    mode: "payment",
    line_items: [
      // {
      //   price_data: {
      //     currency: "pln",
      //     product_data: {
      //       name: `Wpisowe - udział w kosztach organizacji wydarzenia.`,
      //     },
      //     unit_amount: price * 100,
      //   },
      //   quantity: 1,
      // },
      {
        price_data: {
          currency: "pln",
          product_data: {
            name: "Wpisowe - udział w kosztach organizacji wydarzenia.",
          },
          unit_amount: price * 100, // Полная сумма: event price + ваша fee (e.g. 220 PLN * 100)
          // tax_rates: ["txr_xxxxxxxxxxxx"], // Опционально: ID tax rate из Stripe dashboard для auto-VAT (e.g. 8% или 23%) }
        },
        quantity: 1,
      },

      // {
      //   price_data: {
      //     currency: "pln",
      //     product_data: {
      //       name: "Opłata serwisowa platformy (obsługa płatności i rozwój).",
      //     },
      //     unit_amount: Math.round(price * 100 * 0.05) + 2,
      //   },
      //   quantity: 1,
      // },
    ],

    payment_intent_data: {
      // transfer_data: { destination: stripe_account_id!, amount: price * 100 },
      application_fee_amount: calculatePlatformFeeAmount(price * 100),
      receipt_email: payer_email,
      metadata: {
        eventId: event_id,
        userId: payer_user_id,
      },
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
    success_url: `${url}/${locale}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}&redirect=${encodeURIComponent(
      redirectUrl
    )}`,
    cancel_url: `${url}/${locale}/checkout?canceled=true&redirect=${encodeURIComponent(
      redirectUrl
    )}`,
    metadata: {
      eventSlug: event_slug,
      userId: payer_user_id,
      eventId: event_id,
      organizerId: organizer_id,
    },
    locale: locale || "pl",
    automatic_tax: { enabled: true },
  };

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(params, {
      stripeAccount: stripe_account_id,
    });
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    throw new Error("Failed to create payment session");
  }

  const { data, error } = await supabase
    .from("registrations")
    .insert({
      event_id,
      car_id,
      user_id: payer_user_id,
      stripe_session_id: session.id,
      status: RegistrationStatus.PAYMENT_INITIATED,
      payment_type: PaymentType.ONLINE,
    })
    .select()
    .single();

  const paymentError = handleCommonError(error, data);

  return { session, error: paymentError };
}

export async function expirePaymentSession(
  sessionId: string,
  stripeAccountId: string
) {
  const supabase = await createServerSupabaseClient();
  try {
    // TODO check if func will throw error if already paid/expired
    const data = await stripe.checkout.sessions.expire(sessionId, {
      stripeAccount: stripeAccountId,
    });

    if (data.status === "expired") {
      const { error } = await supabase
        .from("registrations")
        .update({
          status: RegistrationStatus.CANCELLED_NO_REFUND,
        })
        .eq("stripe_session_id", sessionId);

      if (error) {
        console.error(
          `Failed to update registration status for expired session ${sessionId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error(`Stripe session ${sessionId} expiration failed:`, error);
  }
}

export async function getOrRetrievePaymentSession(
  sessionId: string | null,
  paymentDetails: {
    price: number;
    stripe_account_id: string;
    organizer_id: string;
    event_slug: string;
    event_id: string;
    car_id: string;
    locale: Stripe.Checkout.SessionCreateParams.Locale;
    url: string;
    payer_user_id: string;
    payer_email: string;
  }
) {
  if (sessionId) {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (stripeSession.payment_status === "paid") {
      await handleSuccessfulPayment(sessionId);

      return { status: RegistrationStatus.PAID };
    }

    if (stripeSession.status === "open") {
      await stripe.checkout.sessions.expire(sessionId);
    }
  }

  try {
    const newSession = await createPaymentSession(paymentDetails);

    return newSession;
  } catch (error) {
    throw error;
  }
}

export async function refundPaymentAfterEventCancel(eventId: string) {
  const supabase = await createServerSupabaseClient();

  const { data: paidOnlineRegistrations } = await supabase
    .from("registrations")
    .select(
      `id, stripe_session_id, 
      event:event_id(user:created_by(stripe_account_id))
      `
    )
    .eq("event_id", eventId)
    .eq("payment_type", PaymentType.ONLINE)
    .in("status", [
      RegistrationStatus.PAID,
      RegistrationStatus.PAYMENT_INITIATED,
    ])
    .throwOnError();

  if (!paidOnlineRegistrations?.length) return;

  const registrationsToRefund: Array<{
    id: string;
    stripe_session_id: string;
    payment_intent_id: string;
    stripe_account_id: string;
  }> = [];

  for (const reg of paidOnlineRegistrations) {
    const stripeAccountId = reg.event.user.stripe_account_id;
    const sessionId = reg.stripe_session_id;

    if (!sessionId || !stripeAccountId) {
      console.log(
        `Skipping registration ${reg.id}: missing session or account ID`
      );
      continue;
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(
        sessionId,
        {
          expand: ["payment_intent"],
        },
        {
          stripeAccount: stripeAccountId,
        }
      );

      if (session.payment_status !== "paid") {
        expirePaymentSession(sessionId, stripeAccountId);
        console.log(
          `Session ${reg.stripe_session_id} not paid, skipping refund`
        );
        continue;
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      if (!paymentIntentId) {
        console.log(`No payment intent for session ${sessionId}`);
        continue;
      }

      registrationsToRefund.push({
        id: reg.id,
        stripe_session_id: sessionId,
        payment_intent_id: paymentIntentId,
        stripe_account_id: stripeAccountId,
      });
    } catch (err: any) {
      console.error(`Failed to retrieve session ${sessionId}:`, err.message);
    }
  }

  if (registrationsToRefund.length === 0) {
    console.log("No registrations eligible for refund");
    return;
  }

  const { error: updateError } = await supabase
    .from("registrations")
    .update({ status: RegistrationStatus.REFUND_INITIATED })
    .in(
      "id",
      registrationsToRefund.map((r) => r.id)
    );

  if (updateError) {
    console.error(
      `Failed to update registration statuses for ${eventId}:`,
      updateError
    );
    throw new Error("failed_to_cancel_registrations");
  }

  for (const reg of registrationsToRefund) {
    createFullRefund({
      payment_intent: reg.payment_intent_id,
      eventId,
      registrationId: reg.id,
      stripe_account_id: reg.stripe_account_id,
    }).catch(async (err) => {
      console.error(
        `Failed to create refund for registration ${reg.id}:`,
        err.message
      );
    });
  }
}

export async function refundPaymentAfterRegistrationCancel(
  registrationId: string
) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: registration } = await supabase
      .from("registrations")
      .select(
        "id, stripe_session_id, event:event_id(id, start_date, user:created_by(stripe_account_id))"
      )
      .eq("id", registrationId)
      .eq("payment_type", PaymentType.ONLINE)
      .in("status", [
        RegistrationStatus.PAID,
        RegistrationStatus.PAYMENT_INITIATED,
      ])
      .single()
      .throwOnError();

    if (!registration) {
      throw new Error("no_registration_found");
    }

    if (
      !registration.stripe_session_id ||
      !registration.event.user.stripe_account_id
    ) {
      throw new Error("missing_stripe_info");
    }

    const session = await stripe.checkout.sessions.retrieve(
      registration.stripe_session_id,
      {
        expand: ["payment_intent.latest_charge.balance_transaction"],
      },
      {
        stripeAccount: registration.event.user.stripe_account_id,
      }
    );

    if (
      !session.payment_intent ||
      typeof session.payment_intent === "string" ||
      !session.payment_intent.latest_charge ||
      typeof session.payment_intent.latest_charge === "string" ||
      !session.payment_intent.latest_charge.balance_transaction ||
      typeof session.payment_intent.latest_charge.balance_transaction ===
        "string"
    ) {
      console.log(
        `Session ${registration.stripe_session_id} missing payment intent or charge info, skipping refund`
      );
      throw new Error("missing_payment_info");
    }

    if (
      session.payment_status !== "paid" ||
      session.payment_intent.latest_charge.balance_transaction.net <= 0
    ) {
      console.log(
        `Session ${registration.stripe_session_id} not paid or not a charge, skipping refund`
      );
      throw new Error("not_paid");
    }

    await supabase
      .from("registrations")
      .update({ status: RegistrationStatus.REFUND_INITIATED })
      .eq("id", registration.id)
      .throwOnError();

    await createPartialRefund({
      payment_intent_id: session.payment_intent.id,
      amount: calculateRefundAmount(
        new Date(registration.event.start_date),
        session.payment_intent.latest_charge.balance_transaction.net
      ),
      eventId: registration.event.id,
      registrationId: registration.id,
      stripe_account_id: registration.event.user.stripe_account_id,
    });

    console.log(`Refund initiated for registration ${registrationId}`);
  } catch (error: any) {
    console.error(
      `Failed to initiate refund for registration ${registrationId}:`,
      error.message
    );
    throw error;
  }
}

async function createFullRefund({
  payment_intent,
  eventId,
  registrationId,
  stripe_account_id,
}: {
  payment_intent: string | Stripe.PaymentIntent;
  eventId: string;
  registrationId: string;
  stripe_account_id: string;
}) {
  if (payment_intent) {
    await stripe.refunds.create(
      {
        payment_intent: payment_intent.toString(),
        // reverse_transfer: true,
        refund_application_fee: true,
        reason: "requested_by_customer",
        metadata: {
          reason: "event_cancelled",
          event_id: eventId,
          registration_id: registrationId,
        },
      },
      {
        stripeAccount: stripe_account_id,
      }
    );
  }
}

async function createPartialRefund({
  payment_intent_id,
  eventId,
  registrationId,
  amount,
  stripe_account_id,
}: {
  payment_intent_id: string;
  eventId: string;
  registrationId: string;
  amount: number;
  stripe_account_id: string;
}) {
  if (payment_intent_id) {
    await stripe.refunds.create(
      {
        payment_intent: payment_intent_id,
        // reverse_transfer: true,
        refund_application_fee: false,
        amount: amount,
        reason: "requested_by_customer",
        metadata: {
          reason: "registration_cancelled",
          event_id: eventId,
          registration_id: registrationId,
        },
      },
      {
        stripeAccount: stripe_account_id,
      }
    );
  }
}

async function autoRefundPayment({
  stripe_session_id,
  eventId,
  registrationId,
}: {
  stripe_session_id: string;
  eventId: string;
  registrationId: string;
}) {
  try {
    const session = await stripe.checkout.sessions.retrieve(stripe_session_id);

    if (session.payment_intent) {
      await stripe.refunds.create({
        payment_intent: session.payment_intent.toString(),
        reverse_transfer: true,
        refund_application_fee: true,
        reason: "requested_by_customer",
        metadata: {
          reason: "auto_refund",
          event_id: eventId,
          registration_id: registrationId,
        },
      });
    }
  } catch (error: any) {
    console.error(
      `Failed to initiate auto refund for registration ${registrationId}:`,
      error.message
    );
  }
}
