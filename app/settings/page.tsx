import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PushSubscribeButton } from "@/components/PushSubscribeButton";

export default function SettingsPage() {
  return (
    <PageShell gap={5}>
      <PageHeader title="설정" />
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          알림
        </h2>
        <PushSubscribeButton />
      </section>
    </PageShell>
  );
}
