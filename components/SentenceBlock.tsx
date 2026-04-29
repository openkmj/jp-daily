"use client";

import type { RichSentence } from "@/lib/schema";

export function SentenceBlock({
  sentence,
  revealed,
}: {
  sentence: RichSentence;
  revealed: boolean;
}) {
  return (
    <>
      <div className="flex flex-wrap items-start gap-x-2 gap-y-3">
        {sentence.tokens.map((t, i) => (
          <div
            key={i}
            className="flex min-w-0 flex-col items-center gap-1 px-1.5 py-1"
          >
            <span className="text-[24px] leading-none font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
              {t.jp}
            </span>
            <span className="text-[11px] leading-none tracking-wide text-zinc-400">
              {t.pron}
            </span>
            <span
              aria-hidden={!revealed}
              className={`text-[12px] leading-tight text-zinc-700 transition-opacity duration-150 dark:text-zinc-300 ${
                revealed ? "opacity-100" : "opacity-0"
              }`}
            >
              {t.meaning}
            </span>
          </div>
        ))}
      </div>

      <p
        aria-hidden={!revealed}
        className={`mt-5 border-t border-zinc-100 pt-4 text-[15px] text-zinc-700 transition-opacity duration-150 dark:border-zinc-800 dark:text-zinc-300 ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-zinc-400">→</span> {sentence.meaning}
      </p>
    </>
  );
}
