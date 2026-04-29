"use client";

import Link from "next/link";
import { useState } from "react";
import { formatKstDateLabel } from "@/lib/date";

const PAGE = 10;

export function LibraryList({ dates }: { dates: string[] }) {
  const [count, setCount] = useState(PAGE);
  const visible = dates.slice(0, count);
  const hasMore = count < dates.length;
  const remaining = dates.length - count;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {visible.map((d) => (
          <li key={d}>
            <Link
              href={`/lessons/${d}`}
              className="flex items-center justify-between px-4 py-4 text-base font-medium transition active:bg-zinc-50 dark:active:bg-zinc-800"
            >
              <span>{formatKstDateLabel(d)}</span>
              <span className="text-zinc-300">›</span>
            </Link>
          </li>
        ))}
      </ul>
      {hasMore ? (
        <button
          type="button"
          onClick={() =>
            setCount((c) => Math.min(c + PAGE, dates.length))
          }
          className="rounded-2xl border border-zinc-200 bg-white py-3 text-sm font-medium text-zinc-700 transition active:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          더 보기 · {remaining}개 남음
        </button>
      ) : null}
    </div>
  );
}
