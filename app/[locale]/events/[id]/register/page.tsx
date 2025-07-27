import { EventRegisterPage } from "@/components/pages/EventRegisterPage/EventRegisterPage";

export default function EventRegister({ params }: { params: { id: string } }) {
  return <EventRegisterPage eventSlug={params.id} />;
}
