import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ProfilePage } from "@/components/pages/ProfilePage/ProfilePage";
import { isAuthWithRedirect } from "@/lib/helpers/isAuthWithRedirect";

export default async function Profile({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const requestUrl = `/${locale}/profile${
    Object.keys(searchParams).length
      ? `?${new URLSearchParams(searchParams as any)}`
      : ""
  }`;

  const supabase = await createServerSupabaseClient();
  const user = await isAuthWithRedirect(supabase, locale, requestUrl, true);

  return <ProfilePage user={user} />;
}
