// app/api/events/bounds
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    debugger;
    // Фильтры
    const levels = searchParams.getAll("level");
    const types = searchParams.getAll("type");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const freePlaces = searchParams.get("freePlaces");

    // bounds
    const north = Number.parseFloat(searchParams.get("north") || "0");
    const south = Number.parseFloat(searchParams.get("south") || "0");
    const east = Number.parseFloat(searchParams.get("east") || "0");
    const west = Number.parseFloat(searchParams.get("west") || "0");

    if (!north || !south || !east || !west) {
      return NextResponse.json(
        { message: "Invalid bounds parameters" },
        { status: 400 }
      );
    }

    if (north <= south || east <= west) {
      return NextResponse.json(
        {
          message: "Invalid bounds: north must be > south, east must be > west",
        },
        { status: 400 }
      );
    }

    // Вызов функции Supabase
    const { data, error } = await supabase.rpc("get_locations_with_event_ids", {
      north,
      south,
      east,
      west,
      p_level: levels.length ? levels : null,
      p_type: types.length ? types : null,
      price_min: priceMin ? parseFloat(priceMin) : null,
      price_max: priceMax ? parseFloat(priceMax) : null,
      date_from: dateFrom || null,
      date_to: dateTo || null,
      free_min: freePlaces ? parseFloat(freePlaces) : null,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
