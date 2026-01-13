import { EditEventPage } from "@/components/pages/EditEventPage/EditEventPage";
import { getEvent } from "@/lib/api/events";
import { isAuthWithRedirect } from "@/lib/helpers/isAuthWithRedirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { EventStatus } from "@/lib/supabase/types";
import { redirect } from "next/navigation";

export default async function EditEvent({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  const supabase = await createServerSupabaseClient();

  const user = await isAuthWithRedirect(
    supabase,
    locale,
    `/${locale}/event/${id}/edit`
  );
  const event = await getEvent(id);

  if (user.id !== event?.created_by || event?.status !== EventStatus.ACTIVE) {
    redirect(`/${locale}/event/${id}`);
  }

  return <EditEventPage event={event} userId={user.id} />;
}
