import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const north = Number.parseFloat(searchParams.get("north") || "0");
  const south = Number.parseFloat(searchParams.get("south") || "0");
  const east = Number.parseFloat(searchParams.get("east") || "0");
  const west = Number.parseFloat(searchParams.get("west") || "0");
  const limit = Number.parseInt(searchParams.get("limit") || "100");

  const supabase = await createServerSupabaseClient();

  try {
    // Validate bounds
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

    // Query locations within bounds
    const { data, error } = await supabase.rpc("locations_in_bbox", {
      west,
      south,
      east,
      north,
    });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { message: "Failed to fetch locations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      locations: data || [],
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
