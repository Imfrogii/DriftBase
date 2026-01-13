import { EventsPage } from "@/components/pages/EventsPage/EventsPage";
import { SearchParamsFilters } from "@/lib/helpers/filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "View Events",
  description: "View all available motorsport events",
};

export interface EventsPageProps {
  searchParams: Promise<
    SearchParamsFilters & {
      page?: string;
      mapView?: string;
    }
  >;
}

export default function Events({ searchParams }: EventsPageProps) {
  return <EventsPage searchParams={searchParams} />;
}
