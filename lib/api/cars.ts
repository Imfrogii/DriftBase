"use server";

import { createServerSupabaseClient } from "../supabase/server";

export async function getCars(userId: string) {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: cars, error } = await supabase
      .from("cars")
      .select(
        `
        id,
        name,
        model,
        level,
        power,
        description
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return { cars };
  } catch (error) {
    throw error;
  }
}
