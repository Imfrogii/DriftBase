import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { getLocale } from "next-intl/server";

const locales = ["en", "pl", "ru"];

export default getRequestConfig(async () => {
  const locale = await getLocale();

  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./public/locales/${locale}/common.json`)).default,
  };
});
