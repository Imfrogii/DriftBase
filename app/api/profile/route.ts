import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: claims, error: authError } = await supabase.auth.getClaims();

    const userId = claims?.claims.user_metadata?.sub;

    if (authError || !userId) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const profileData = await request.json();

    const { data: profile, error } = await supabase
      .from("users")
      .update({
        display_name: profileData.display_name,
        instagram: profileData.instagram,
        org_name: profileData.org_name,
      })
      .eq("id", userId)
      .select()
      .single();

    if (!profile) {
      return NextResponse.json({ message: "FORBIDDEN" }, { status: 403 });
    }

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
