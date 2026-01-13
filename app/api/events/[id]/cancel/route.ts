import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { deleteFile } from "../route";
import { EventStatus, PaymentType } from "@/lib/supabase/types";
import { refundPaymentAfterEventCancel } from "@/lib/api/payments";

export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const eventData = await request.json();

    const { data: eventImage } = await supabase
      .from("events")
      .select("image_url")
      .eq("id", eventData.id)
      .eq("created_by", user.id)
      .single();

    if (!eventImage) {
      return NextResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    const { data: event, error } = await supabase
      .from("events")
      .update({ status: EventStatus.CANCELLED, image_url: null })
      .eq("id", eventData.id)
      .eq("created_by", user.id)
      .eq("status", EventStatus.ACTIVE)
      .gte("registered_drivers", 1)
      .select()
      .single();

    if (!event) {
      return NextResponse.json({ message: "FORBIDDEN" }, { status: 403 });
    }

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (eventImage.image_url) {
      await deleteFile(supabaseAdmin, eventImage.image_url);
    }

    // TODO error handling with statuses
    if (event.payment_type === PaymentType.ONLINE) {
      await refundPaymentAfterEventCancel(event.id);
    }

    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
