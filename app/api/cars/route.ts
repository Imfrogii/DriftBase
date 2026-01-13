import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const { data: cars, error } = await supabase
      .from("cars")
      .select("name, model, power, description, id, level")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ cars });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const carData: Database["public"]["Tables"]["cars"]["Insert"] =
      await request.json();

    const { name, model, level, power, description } = carData;

    const { data: car, error } = await supabase
      .from("cars")
      .insert({
        name,
        model,
        level,
        power,
        description,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ car });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
