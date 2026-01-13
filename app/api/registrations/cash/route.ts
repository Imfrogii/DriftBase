import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PaymentType, RegistrationStatus } from "@/lib/supabase/types";
import { handleCommonError } from "@/lib/helpers/errors";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const { event_id, car_id } = await request.json();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("payment_type")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ message: "event_not_found" }, { status: 404 });
    }

    if (event.payment_type === PaymentType.ONLINE) {
      return NextResponse.json(
        { message: "incorrect_payment_type" },
        { status: 400 }
      );
    }

    const { data: registration, error } = await supabase
      .from("registrations")
      .insert({
        event_id,
        car_id,
        user_id: user.id,
        payment_type: PaymentType.CASH,
        status: RegistrationStatus.ACTIVE,
      })
      .select()
      .single();

    const customError = handleCommonError(error, registration);
    if (customError) {
      return NextResponse.json(
        { message: customError.code },
        { status: customError.status }
      );
    }

    return NextResponse.json({ registration });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
