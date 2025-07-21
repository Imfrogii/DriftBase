import type { Metadata } from "next"
import { CreateEventPage } from "@/components/pages/CreateEventPage/CreateEventPage"

export const metadata: Metadata = {
  title: "Create Event",
  description: "Create a new motorsport event",
}

export default function CreateEvent() {
  return <CreateEventPage />
}
