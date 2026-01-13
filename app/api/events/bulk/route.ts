// app/api/events/bulk/route.ts

import { SortOrder } from "@/lib/helpers/filters";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EventStatus } from "@/lib/supabase/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy") || "start_date";
  const sortOrder =
    searchParams.get("sortOrder") === SortOrder.DESC ? false : true;
  const eventIds = await request.json();

  try {
    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
          id,
          title,
          slug,
          description_short,
          image_url,
          start_date,
          end_date,
          level,
          type,
          price,
          max_drivers,
          registered_drivers,
          creator:users!events_created_by_fkey(display_name)
        `
      )
      .in("id", eventIds)
      .eq("status", EventStatus.ACTIVE)
      .order(sortBy, { ascending: sortOrder });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
