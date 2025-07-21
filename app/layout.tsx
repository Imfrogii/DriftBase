import type React from "react"
import { Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { ThemeProvider } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { theme } from "@/lib/theme"
import type { Metadata } from "next"
import "./globals.scss"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "DriftBase - Motorsport Events Platform",
    template: "%s | DriftBase",
  },
  description: "Find, create, and register for drift and motorsport events in Poland",
  keywords: ["drift", "motorsport", "events", "racing", "cars", "poland"],
  authors: [{ name: "DriftBase Team" }],
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://driftbase.com",
    siteName: "DriftBase",
    title: "DriftBase - Motorsport Events Platform",
    description: "Find, create, and register for drift and motorsport events in Poland",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DriftBase - Motorsport Events Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DriftBase - Motorsport Events Platform",
    description: "Find, create, and register for drift and motorsport events in Poland",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}


import './globals.css'