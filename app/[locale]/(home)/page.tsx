export const dynamic = "force-dynamic";
import { HomePage } from "@/components/pages/HomePage/HomePage";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  return {
    title: "Home",
    description: "Discover and join drift and motorsport events across Poland",
    openGraph: {
      title: "DriftBase - Find Motorsport Events",
      description:
        "Discover and join drift and motorsport events across Poland",
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  console.log("Home page searchParams:", searchParams);
  const { code } = searchParams; // вот твой ?code=1231231

  if (code) {
    const locale = await getLocale();
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Auth exchangeCodeForSession error:", error);

    if (error) {
      return redirect(`/${locale}/auth/signin?error=${error.code}`);
    }
  }
  return <HomePage />;
}
