import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SortOrder } from "@/lib/helpers/filters";
import { createServerSupabaseClientForAPI } from "@/lib/supabase/api";

export async function GET(request: NextRequest) {
  console.log("fire");
  const supabase = await createServerSupabaseClientForAPI(request);
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy") || "start_date";
  const sortOrder =
    searchParams.get("sortOrder") === SortOrder.DESC ? false : true;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("request", request.cookies, request.credentials);

    if (authError || !user) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    let query = supabase
      .from("events")
      .select(
        `
        *,
        location:locations(*),
        creator:users!events_created_by_fkey(id, display_name),
      `
      )
      .eq("created_by", user.id)
      .order(sortBy, { ascending: sortOrder });

    const size = parseInt(searchParams.get("size") || "30", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const from = (page - 1) * size;
    const to = from + size - 1;

    const {
      data: events,
      count: totalItems,
      error,
    } = await query.range(from, to);

    if (error) {
      NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ events, totalItems });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
