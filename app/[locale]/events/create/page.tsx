import type { Metadata } from "next";
import { CreateEventPage } from "@/components/pages/CreateEventPage/CreateEventPage";
import { isAuthWithRedirect } from "@/lib/helpers/isAuthWithRedirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Create Event",
  description: "Create a new motorsport event",
};

export type CreateEventProps = {
  params: { locale: string };
};

export default async function CreateEvent({
  params: { locale },
}: CreateEventProps) {
  const supabase = await createServerSupabaseClient();
  const user = await isAuthWithRedirect(
    supabase,
    locale,
    `/${locale}/events/create`
  );
  return <CreateEventPage userId={user.id} />;
}
