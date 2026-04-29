import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { TokenizedLessonView } from "@/components/TokenizedLessonView";
import { getLessonByDate } from "@/lib/blob";
import { formatKstDateLabel, todayKst } from "@/lib/date";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  if (date > todayKst()) notFound();
  const lesson = await getLessonByDate(date);
  if (!lesson) notFound();

  return (
    <PageShell>
      <PageHeader
        title={formatKstDateLabel(date)}
        back={{ href: "/library", label: "라이브러리" }}
      />
      <TokenizedLessonView lesson={lesson} />
    </PageShell>
  );
}
