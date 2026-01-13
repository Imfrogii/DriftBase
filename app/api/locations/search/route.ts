import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MapboxLocation } from "@/components/common/LocationSearch/LocationSearch";
import axios from "axios";
import { getLatLng } from "@/lib/helpers/geo";

const accessToken = process.env.MAPBOX_ACCESS_TOKEN || "";

const getExternalLocations = async (search: string, limit: number) => {
  const url = `https://api.mapbox.com/search/geocode/v6/forward?access_token=${accessToken}&q=${encodeURIComponent(
    search
  )}&autocomplete=true&limit=${limit}`;
  try {
    const { data } = await axios.get(url);

    const features: MapboxLocation[] = data.features.map((f: any) => ({
      id: f.id,
      place_name: f.properties.name_preferred || f.place_name,
      center: f.geometry.coordinates,
      place_formatted: f.properties.place_formatted,
      feature_type: f.properties.feature_type,
    }));

    return features;
  } catch (error) {
    throw new Error("Mapbox API error");
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = Number.parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const externalLocationsLimit = 5;

  const supabase = await createServerSupabaseClient();

  try {
    const externalLocations = await getExternalLocations(
      search,
      externalLocationsLimit
    );
    let queryBuilder = supabase
      .from("locations")
      .select("*", { count: "exact" });

    // If search query is provided, filter by name
    if (search.trim()) {
      queryBuilder = queryBuilder.ilike("name", `%${search}%`);
    }

    const { data: locations, error } = await queryBuilder
      .order("name")
      .range(0, limit - externalLocationsLimit - 1);

    const fullLocations = [
      ...((locations?.map((location) => ({
        id: location.id,
        place_name: location.name,
        place_formatted: location.address,
        center: [
          getLatLng(location.geom).longitude,
          getLatLng(location.geom).latitude,
        ],
        address: location.address,
        feature_type: "custom",
      })) || []) as MapboxLocation[]),
      ...externalLocations,
    ];

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { message: "Failed to fetch locations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      locations: fullLocations,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
