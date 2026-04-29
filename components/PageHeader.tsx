import Link from "next/link";

export function PageHeader({
  title,
  back,
}: {
  title: string;
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-col gap-1">
      {back ? (
        <Link
          href={back.href}
          className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← {back.label}
        </Link>
      ) : (
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          jp-daily
        </p>
      )}
      <h1 className="text-2xl font-semibold">{title}</h1>
    </header>
  );
}
