import { HomePage } from "@/components/pages/HomePage/HomePage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover and join drift and motorsport events across Poland",
  openGraph: {
    title: "DriftBase - Find Motorsport Events",
    description: "Discover and join drift and motorsport events across Poland",
  },
};

export default function Home() {
  return <HomePage />;
}
