import { refundPaymentAfterRegistrationCancel } from "@/lib/api/payments";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PaymentType } from "@/lib/supabase/types";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const { data: registration, error: getEventError } = await supabase
      .from("registrations")
      .select("event:event_id(payment_type)")
      .eq("id", params.id)
      .single();

    if (!registration || getEventError) {
      return NextResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    if (registration.event.payment_type === PaymentType.CASH) {
      const { data, error } = await supabase.rpc("soft_delete_registration", {
        p_registration_id: params.id,
        p_user_id: user.id,
      });

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json(
          { message: "Cannot cancel registration" },
          { status: 400 }
        );
      }
    } else {
      try {
        await refundPaymentAfterRegistrationCancel(params.id);
      } catch (error) {
        console.error("Refund error:", error);
        // TODO error handling with statuses
        return NextResponse.json({ message: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
