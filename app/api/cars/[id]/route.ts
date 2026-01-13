import { handleCommonError } from "@/lib/helpers/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";
import { NextRequest, NextResponse } from "next/server";

const CAR_ERRORS = {
  CAR_IN_USE: { status: 400 },
} as const;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: claims, error: authError } = await supabase.auth.getClaims();

    const userId = claims?.claims.user_metadata?.sub;
    if (authError || !userId) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const carData: Database["public"]["Tables"]["cars"]["Update"] =
      await request.json();

    const { name, model, level, power, description } = carData;

    const { data: car, error } = await supabase
      .from("cars")
      .update({
        name,
        model,
        level,
        power,
        description,
      })
      .eq("user_id", userId)
      .eq("id", params.id)
      .select()
      .single();

    if (!car) {
      return NextResponse.json({ message: "FORBIDDEN" }, { status: 403 });
    }

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: claims, error: authError } = await supabase.auth.getClaims();
    const userId = claims?.claims.user_metadata?.sub;

    if (authError || !userId) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const { data, error } = await supabase.rpc("soft_delete_car", {
      p_car_id: params.id,
    });

    const result = handleCommonError(error, data, CAR_ERRORS);
    if (result) {
      return NextResponse.json(
        { error: result.code },
        { status: result.status }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
