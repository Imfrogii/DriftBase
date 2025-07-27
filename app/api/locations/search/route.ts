import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const lat = Number.parseFloat(searchParams.get("lat") || "0");
  const lng = Number.parseFloat(searchParams.get("lng") || "0");
  const radius = Number.parseFloat(searchParams.get("radius") || "10"); // radius in km
  const page = Number.parseInt(searchParams.get("page") || "1");
  const limit = Number.parseInt(searchParams.get("limit") || "20");

  const supabase = createServerClient();

  try {
    let queryBuilder = supabase
      .from("locations")
      .select("*", { count: "exact" });

    // If search query is provided, filter by name
    if (query.trim()) {
      queryBuilder = queryBuilder.ilike("name", `%${query}%`);
    }

    // Calculate distance using Haversine formula approximation
    // For better performance, we use a bounding box first, then calculate exact distance
    if (lat && lng && radius > 0) {
      // Calculate bounding box (approximate)
      const latDelta = radius / 111.32; // 1 degree lat ≈ 111.32 km
      const lngDelta = radius / (111.32 * Math.cos((lat * Math.PI) / 180));

      queryBuilder = queryBuilder
        .gte("latitude", lat - latDelta)
        .lte("latitude", lat + latDelta)
        .gte("longitude", lng - lngDelta)
        .lte("longitude", lng + lngDelta);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const {
      data: locations,
      error,
      count,
    } = await queryBuilder.range(from, to).order("name");

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch locations" },
        { status: 500 }
      );
    }

    // Filter by exact distance if coordinates are provided
    let filteredLocations = locations || [];
    if (lat && lng && radius > 0) {
      filteredLocations = (locations || []).filter((location) => {
        const distance = calculateDistance(
          lat,
          lng,
          location.latitude,
          location.longitude
        );
        return distance <= radius;
      });
    }

    return NextResponse.json({
      locations: filteredLocations,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { name, latitude, longitude } = body;

    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: location, error } = await supabase
      .from("locations")
      .insert({
        name,
        latitude: Number.parseFloat(latitude),
        longitude: Number.parseFloat(longitude),
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create location" },
        { status: 500 }
      );
    }

    return NextResponse.json({ location });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
