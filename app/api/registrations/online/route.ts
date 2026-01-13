import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PaymentType } from "@/lib/supabase/types";

import { createPaymentSession } from "@/lib/api/payments";
import { handleCommonError } from "@/lib/helpers/errors";

const url = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }

  const { event_id, car_id, locale } = await request.json();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      `
          payment_type,
          slug,
          price,
          created_by!inner(
            id,
            stripe_account_id
          )
        `
    )
    .eq("id", event_id)
    .single();

  const getEventError = handleCommonError(eventError, event);

  if (getEventError) {
    return NextResponse.json(
      { message: getEventError.code },
      { status: getEventError.status }
    );
  }

  if (event!.payment_type === PaymentType.CASH) {
    return NextResponse.json(
      { message: "incorrect_payment_type" },
      { status: 400 }
    );
  }

  try {
    const { session, error: supabaseError } = await createPaymentSession({
      price: event!.price,
      stripe_account_id: event!.created_by.stripe_account_id!,
      organizer_id: event!.created_by.id,
      event_slug: event!.slug,
      event_id,
      car_id,
      locale,
      url,
      payer_user_id: user.id,
      payer_email: user.email!,
    });

    if (supabaseError) {
      return NextResponse.json(
        { message: supabaseError.code },
        { status: supabaseError.status }
      );
    }

    // TODO email link to payment
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
