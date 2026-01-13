// api/locations/reverse/route.ts
import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";

const accessToken = process.env.MAPBOX_ACCESS_TOKEN || "";

const getReverseGeocode = async (lat: number, lon: number) => {
  const url = `https://api.mapbox.com/search/geocode/v6/reverse`;
  try {
    const { data } = await axios.get(url, {
      params: {
        access_token: accessToken,
        longitude: lon,
        latitude: lat,
        limit: 1,
      },
    });

    if (!data.features || data.features.length === 0) {
      return null;
    }

    const f = data.features[0];

    return {
      id: f.id,
      place_name: f.properties.name_preferred || f.properties.name,
      place_formatted: f.properties.place_formatted,
      center: f.geometry.coordinates,
      feature_type: f.properties.feature_type,
      full_address: f.properties.full_address,
    };
  } catch (error) {
    throw error;
  }
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = Number.parseFloat(searchParams.get("latitude") || "0");
  const longitude = Number.parseFloat(searchParams.get("longitude") || "0");

  try {
    const locationInfo = await getReverseGeocode(latitude, longitude);

    return NextResponse.json({ locationInfo });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
