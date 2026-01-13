"use server";
import { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export const isAuthWithRedirect = async (
  supabase: SupabaseClient,
  locale: string,
  redirectUrl: string,
  returnDBUser = false
) => {
  const url = `/${locale}/auth/signin?redirect=${encodeURIComponent(
    redirectUrl
  )}`;

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (!session || sessionError) {
    redirect(url);
  }

  const user = session.user;

  if (returnDBUser) {
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select(
        `
        id,
        display_name,
        email,
        instagram
      `
      )
      .eq("id", user.id)
      .single();

    if (dbError || !dbUser) {
      redirect(url);
    }

    return dbUser;
  }

  return {
    id: user.id,
    email: user.email ?? null,
  };
};
