import SMSApp from "@/components/SMSApp";

export default function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return <SMSApp initialTab="dashboard" initialSearchParams={searchParams} />;
}
