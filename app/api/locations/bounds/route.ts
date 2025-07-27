import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const north = Number.parseFloat(searchParams.get("north") || "0");
  const south = Number.parseFloat(searchParams.get("south") || "0");
  const east = Number.parseFloat(searchParams.get("east") || "0");
  const west = Number.parseFloat(searchParams.get("west") || "0");
  const limit = Number.parseInt(searchParams.get("limit") || "100");

  const supabase = createServerClient();

  try {
    // Validate bounds
    if (!north || !south || !east || !west) {
      return NextResponse.json(
        { error: "Invalid bounds parameters" },
        { status: 400 }
      );
    }

    if (north <= south || east <= west) {
      return NextResponse.json(
        { error: "Invalid bounds: north must be > south, east must be > west" },
        { status: 400 }
      );
    }

    // Query locations within bounds
    const { data: locations, error } = await supabase
      .from("locations")
      .select("*")
      .gte("latitude", south)
      .lte("latitude", north)
      .gte("longitude", west)
      .lte("longitude", east)
      //   .limit(limit)
      .order("name");

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch locations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      locations: locations || [],
      bounds: { north, south, east, west },
      count: locations?.length || 0,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
