import { EditEventPage } from "@/components/pages/EditEventPage/EditEventPage";

export default function EditEvent({ params }: { params: { id: string } }) {
  return <EditEventPage eventSlug={params.id} />;
}
