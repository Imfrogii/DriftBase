import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MyRegistrationsPage } from "@/components/pages/MyRegistrationsPage/MyRegistrationsPage";
import { isAuthWithRedirect } from "@/lib/helpers/isAuthWithRedirect";

export default async function Registrations({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const supabase = await createServerSupabaseClient();
  const user = await isAuthWithRedirect(
    supabase,
    locale,
    `/${locale}/my-registrations`
  );

  return <MyRegistrationsPage searchParams={searchParams} userId={user.id} />;
}
