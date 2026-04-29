import { LibraryList } from "@/components/LibraryList";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { getMonthsBack } from "@/lib/blob";
import { todayKst } from "@/lib/date";

const INITIAL_MONTHS = 3;

export default async function LibraryPage() {
  const today = todayKst();
  const archives = await getMonthsBack(INITIAL_MONTHS);
  const dates = archives
    .flatMap((a) => Object.keys(a.lessons))
    .filter((d) => d <= today)
    .sort((a, b) => b.localeCompare(a));

  return (
    <PageShell gap={5}>
      <PageHeader title="라이브러리" />
      <LibraryList dates={dates} />
    </PageShell>
  );
}
