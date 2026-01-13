import CodeScannerPage from "@/components/pages/CodeScannerPage/CodeScannerPage";
import { isAuthWithRedirect } from "@/lib/helpers/isAuthWithRedirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Scanner({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const supabase = await createServerSupabaseClient();

  await isAuthWithRedirect(supabase, locale, `/${locale}/scanner`);

  return <CodeScannerPage />;
}
