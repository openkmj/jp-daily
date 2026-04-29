import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { TokenizedLessonView } from "@/components/TokenizedLessonView";
import { getLessonByDate } from "@/lib/blob";
import { formatKstDateLabel, todayKst } from "@/lib/date";

export default async function HomePage() {
  const date = todayKst();
  const lesson = await getLessonByDate(date);

  return (
    <PageShell>
      <PageHeader title={formatKstDateLabel(date)} />
      {lesson ? (
        <TokenizedLessonView lesson={lesson} />
      ) : (
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          오늘의 레슨이 아직 준비되지 않았어요.
        </section>
      )}
    </PageShell>
  );
}
