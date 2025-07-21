import type { Metadata } from "next"
import { HomePage } from "@/components/pages/HomePage/HomePage"

export const metadata: Metadata = {
  title: "Home",
  description: "Discover and join drift and motorsport events across Poland",
  openGraph: {
    title: "DriftBase - Find Motorsport Events",
    description: "Discover and join drift and motorsport events across Poland",
  },
}

export default function Home() {
  return <HomePage />
}
