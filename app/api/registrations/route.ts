import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    let query = supabase
      .from("registrations")
      .select(
        `
        *,
        event:events(*),
        car:cars(*)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    const level = searchParams.get("level");
    const priceMax = searchParams.get("priceMax");

    if (level) {
      query = query.eq("event.level", level);
    }
    if (priceMax) {
      query = query.lte("event.price", Number(priceMax));
    }

    const { data: registrations, error } = await query;

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ registrations });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
