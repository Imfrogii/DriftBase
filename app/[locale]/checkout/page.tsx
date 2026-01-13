import PaymentResultPage from "@/components/pages/PaymentResultPage/PaymentResultPage";

export default async function Profile({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <PaymentResultPage searchParams={searchParams} />;
}
