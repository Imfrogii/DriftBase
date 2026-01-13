import { ScannerError } from "@/components/common/ScannerResult/ScannerError";
import ScannerSuccessClient from "@/components/common/ScannerResult/ScannerSuccess";
import { checkInWithCode } from "@/lib/api/registrations";
import { isAuthWithRedirect } from "@/lib/helpers/isAuthWithRedirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Scanner({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { c: string };
}) {
  const supabase = await createServerSupabaseClient();

  const requestUrl = `/${locale}/scan${
    Object.keys(searchParams).length
      ? `?${new URLSearchParams(searchParams as any)}`
      : ""
  }`;

  await isAuthWithRedirect(supabase, locale, requestUrl);

  try {
    await checkInWithCode(searchParams.c);

    return <ScannerSuccessClient redirectUrl={`/${locale}/scanner`} />;
  } catch (error: any) {
    return (
      <ScannerError
        redirectUrl={`/${locale}/scanner`}
        message={error.message}
      />
    );
  }
}
