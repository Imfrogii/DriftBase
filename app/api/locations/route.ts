import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type LocationInsert = {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
};

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const body: LocationInsert = await request.json();
    const { name, latitude, longitude, address } = body;

    if (!name || !latitude || !longitude || !address) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const wkt = `POINT(${longitude} ${latitude})`;

    const { data: location, error } = await supabase
      .from("locations")
      .insert({
        geom: wkt,
        address,
        name,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { message: "Failed to create location" },
        { status: 500 }
      );
    }

    return NextResponse.json({ location });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
