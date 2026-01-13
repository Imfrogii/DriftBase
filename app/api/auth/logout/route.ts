import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
