import type React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import "../globals.scss";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata = {
  title: "DriftBase - Motorsport Events Platform",
  description: "Find, create, and register for drift and motorsport events",
  keywords: "drift, motorsport, events, racing, cars",
  openGraph: {
    title: "DriftBase - Motorsport Events Platform",
    description: "Find, create, and register for drift and motorsport events",
    type: "website",
  },
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <Navbar locale={locale} />
                <main>{children}</main>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
