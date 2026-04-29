import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { ReviewSession } from "@/components/ReviewSession";
import { getMonthsBack } from "@/lib/blob";
import { todayKst } from "@/lib/date";
import type { RichSentence } from "@/lib/schema";

const REVIEW_MONTH_WINDOW = 2;

export default async function ReviewPage() {
  const today = todayKst();
  const archives = await getMonthsBack(REVIEW_MONTH_WINDOW);
  const pool: RichSentence[] = archives
    .flatMap((a) =>
      Object.entries(a.lessons)
        .filter(([d]) => d <= today)
        .flatMap(([, l]) => l.sentences),
    );

  return (
    <PageShell gap={5}>
      <PageHeader title="복습" />
      <ReviewSession pool={pool} />
    </PageShell>
  );
}
