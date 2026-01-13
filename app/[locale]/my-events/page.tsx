import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import { isAuthWithRedirect } from "@/lib/helpers/isAuthWithRedirect";
import { MyEventsPage } from "@/components/pages/MyEventsPage/MyEventsPage";

export type MyEventsProps = {
  params: { locale: string };
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function MyEvents({
  params: { locale },
  searchParams,
}: MyEventsProps) {
  const supabase = await createServerSupabaseClient();
  const user = await isAuthWithRedirect(
    supabase,
    locale,
    `/${locale}/my-events`
  );

  return <MyEventsPage searchParams={searchParams} userId={user.id} />;
}
