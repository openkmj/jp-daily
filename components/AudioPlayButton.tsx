"use client";

import { useEffect, useRef, useState } from "react";

export function AudioPlayButton({
  url,
  className = "",
}: {
  url?: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!url) return null;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlaying(false);
      return;
    }
    const audio = new Audio(url);
    audio.onended = () => setPlaying(false);
    audio.onpause = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    audioRef.current = audio;
    setPlaying(true);
    audio.play().catch(() => setPlaying(false));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "일시정지" : "재생"}
      className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-zinc-100 text-[13px] text-zinc-700 transition active:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:active:bg-zinc-700 ${className}`}
    >
      {playing ? "⏸" : "▶"}
    </button>
  );
}
