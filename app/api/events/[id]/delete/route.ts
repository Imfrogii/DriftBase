import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { deleteFile } from "../route";

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

    const { data, error } = await supabase.rpc("soft_delete_event", {
      p_event_id: eventData.id,
      p_user_id: user.id,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ message: "Cannot delete" }, { status: 400 });
    }

    if (eventImage.image_url) {
      await deleteFile(supabaseAdmin, eventImage.image_url);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
