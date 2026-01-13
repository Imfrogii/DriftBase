import type React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navbar } from "@/components/layout/Navbar/Navbar";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";
import "../globals.scss";
import Footer from "@/components/common/Footer/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { SnackbarProvider } from "@/components/providers/ShackbarProvider";

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
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              <SnackbarProvider>
                <Navbar locale={locale} initialSession={session} />
                <main>
                  {children}
                  <ScrollToTop />
                </main>
              </SnackbarProvider>
              <Footer />
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
