"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SentenceCard } from "@/components/SentenceCard";
import { StepProgress } from "@/components/StepProgress";
import type { RichLesson } from "@/lib/schema";

export function TokenizedLessonView({ lesson }: { lesson: RichLesson }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const total = lesson.sentences.length;
  const sentence = lesson.sentences[index];
  const isLast = index === total - 1;
  const filled = index + (revealed ? 1 : 0);

  const handleAction = () => {
    if (!revealed) {
      setRevealed(true);
    } else if (!isLast) {
      setIndex((i) => i + 1);
      setRevealed(false);
    } else {
      setIndex(0);
      setRevealed(false);
    }
  };

  const buttonLabel = !revealed
    ? "풀이 보기"
    : isLast
      ? "처음으로"
      : "다음 →";

  return (
    <section className="flex flex-1 flex-col gap-5">
      <div className="flex items-center gap-3">
        <StepProgress total={total} filled={filled} />
        <span className="text-[11px] tabular-nums text-zinc-500">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>
      </div>

      <SentenceCard
        key={index}
        sentence={sentence}
        revealed={revealed}
        className="animate-slide-in-right"
      />

      <PrimaryButton onClick={handleAction}>{buttonLabel}</PrimaryButton>
    </section>
  );
}
