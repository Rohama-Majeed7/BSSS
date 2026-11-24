import SMSApp from "@/components/SMSApp";
import { notFound } from "next/navigation";

const VALID_TAB_SET = new Set([
  "dashboard",
  "students",
  "attendance",
  "fees",
  "results",
  "idcards",
  "slc",
  "staff",
  "excelhub",
]);

export function generateStaticParams() {
  return Array.from(VALID_TAB_SET).map((tab) => ({
    tab,
  }));
}

export default function TabPage({
  params,
  searchParams,
}: {
  params: { tab: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const normalized = params.tab?.toLowerCase();
  if (!normalized || !VALID_TAB_SET.has(normalized)) {
    notFound();
  }
  return <SMSApp initialTab={normalized} initialSearchParams={searchParams} />;
}
