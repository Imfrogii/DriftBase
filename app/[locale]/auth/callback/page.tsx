export const dynamic = "force-dynamic";
import { HomePage } from "@/components/pages/HomePage/HomePage";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const { code } = searchParams; // вот твой ?code=1231231

  if (code) {
    const locale = await getLocale();
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Auth exchangeCodeForSession error:", error);

    if (error) {
      return redirect(`/${locale}/auth/signin?error=${error.code}`);
    }

    redirect(`/${locale}`);
  }
  return <HomePage />;
}
