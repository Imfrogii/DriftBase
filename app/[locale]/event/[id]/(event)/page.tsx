import ViewEventPage from "@/components/pages/ViewEventPage/ViewEventPage";

export default function ViewEvent({ params }: { params: { id: string } }) {
  return <ViewEventPage id={params.id} />;
}
