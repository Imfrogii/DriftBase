// /api/payment/status/[sessionId]/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data } = await supabase
      .from("registrations")
      .select("status")
      .eq("stripe_session_id", params.sessionId)
      .single();

    if (!data) {
      return NextResponse.json(
        { message: "session_not_found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: data.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
