import { createServerSupabaseClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: claims, error: authError } = await supabase.auth.getClaims();

    const userId = claims?.claims.user_metadata?.sub;

    if (authError || !userId) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const data = await request.json();
    const registration_id = data.registration_id as string;

    const { data: registration, error } = await supabase
      .from("registrations")
      .select("event_id")
      .eq("user_id", userId)
      .eq("id", registration_id)
      .single();

    if (!registration || error) {
      return NextResponse.json({ message: "NOT_FOUND" }, { status: 404 });
    }

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = Math.floor(100000 + Math.random() * 900000);

      console.log(
        format(new Date(Date.now()), "yyyy-MM-dd'T'HH:mm:ss.SSS"),
        format(
          new Date(Date.now() + 3 * 60 * 1000),
          "yyyy-MM-dd'T'HH:mm:ss.SSS"
        )
      );

      const { data, error: insertError } = await supabase
        .from("registration_codes")
        .insert({
          registration_id: registration_id,
          code,
          expires_at: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 minutes from now
        })
        .select()
        .single();

      if (insertError && insertError.code === "23505") {
        // 23505 = unique_violation в Postgres
        attempts++;
        continue;
      }

      if (insertError) {
        return NextResponse.json(
          { message: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          registration_code: data.code,
          expires_at: data.expires_at,
          event_id: registration.event_id,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
