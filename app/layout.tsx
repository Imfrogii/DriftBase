import type React from "react"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { QueryProvider } from "@/components/providers/QueryProvider"
import "./globals.scss"

export const metadata = {
  title: "DriftBase - Motorsport Events Platform",
  description: "Find, create, and register for drift and motorsport events",
  keywords: "drift, motorsport, events, racing, cars",
  openGraph: {
    title: "DriftBase - Motorsport Events Platform",
    description: "Find, create, and register for drift and motorsport events",
    type: "website",
  },
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}


import './globals.css'