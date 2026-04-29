"use client";

import { SentenceBlock } from "@/components/SentenceBlock";
import type { RichSentence } from "@/lib/schema";

export function SentenceCard({
  sentence,
  revealed,
  className = "",
}: {
  sentence: RichSentence;
  revealed: boolean;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      <div className="p-6">
        <SentenceBlock sentence={sentence} revealed={revealed} />
      </div>
      {revealed && sentence.keyPoints && sentence.keyPoints.length > 0 ? (
        <div className="border-t border-zinc-100 bg-zinc-50/60 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
          <ul className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300">
            {sentence.keyPoints.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-zinc-400">·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
