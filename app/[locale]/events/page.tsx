import { EventsPage } from "@/components/pages/EventsPage/EventsPage"
import { Suspense } from "react"

interface EventsPageProps {
  searchParams: Promise<{
    level?: string
    priceMin?: string
    priceMax?: string
    dateFrom?: string
    dateTo?: string
    page?: string
  }>
}

export default async function Events({ searchParams }: EventsPageProps) {
  const params = await searchParams
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsPage searchParams={params} />
    </Suspense>
  )
}
