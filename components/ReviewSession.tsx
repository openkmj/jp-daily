"use client";

import { useMemo, useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SentenceCard } from "@/components/SentenceCard";
import { StepProgress } from "@/components/StepProgress";
import type { RichSentence } from "@/lib/schema";

const SIZE = 10;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ReviewSession({ pool }: { pool: RichSentence[] }) {
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const queue = useMemo(() => {
    void seed;
    return shuffle(pool).slice(0, SIZE);
  }, [pool, seed]);

  if (queue.length === 0) {
    return (
      <p className="text-sm text-zinc-500">아직 학습한 표현이 없어요.</p>
    );
  }

  const finished = index >= queue.length;
  const item = !finished ? queue[index] : null;
  const total = queue.length;
  const filled = finished ? total : index + (revealed ? 1 : 0);

  const advance = () => {
    setIndex((i) => i + 1);
    setRevealed(false);
  };
  const restart = () => {
    setSeed((s) => s + 1);
    setIndex(0);
    setRevealed(false);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <StepProgress total={total} filled={filled} />
        <span className="text-[11px] tabular-nums text-zinc-500">
          {String(finished ? total : index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>
      </div>

      {finished ? (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="py-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              완료
            </p>
            <p className="mt-2 text-3xl font-semibold">{total}개 끝</p>
          </div>
        </div>
      ) : item ? (
        <SentenceCard
          key={`${seed}-${index}`}
          sentence={item}
          revealed={revealed}
          className="animate-slide-in-right"
        />
      ) : null}

      {finished ? (
        <PrimaryButton onClick={restart}>다시 풀기</PrimaryButton>
      ) : (
        <PrimaryButton
          onClick={revealed ? advance : () => setRevealed(true)}
        >
          {revealed ? "다음 →" : "탭해서 답 보기"}
        </PrimaryButton>
      )}
    </>
  );
}
