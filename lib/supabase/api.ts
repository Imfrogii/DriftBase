// lib/supabase/apiClient.ts
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";
import { NextRequest, NextResponse } from "next/server";

export function createServerSupabaseClientForAPI(request: NextRequest) {
  // const response = NextResponse.next();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // cookiesToSet.forEach(({ name, value, options }) =>
          //   response.cookies.set(name, value, options)
          // );
        },
      },
    }
  );

  return supabase;
}
