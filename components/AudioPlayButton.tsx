"use client";

import { useEffect, useRef, useState } from "react";

export function AudioPlayButton({
  url,
  autoPlay = false,
  className = "",
}: {
  url?: string;
  autoPlay?: boolean;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
  };

  const play = () => {
    if (!url) return;
    stop();
    const a = new Audio(url);
    a.onended = () => setPlaying(false);
    a.onpause = () => setPlaying(false);
    a.onerror = () => setPlaying(false);
    audioRef.current = a;
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  useEffect(() => {
    if (autoPlay) play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  if (!url) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (playing) stop();
        else play();
      }}
      aria-label={playing ? "정지" : "듣기"}
      className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200 transition active:scale-95 active:bg-zinc-50 dark:bg-zinc-800 dark:ring-zinc-700 dark:active:bg-zinc-700 ${className}`}
    >
      <SpeakerIcon playing={playing} />
    </button>
  );
}

function SpeakerIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-900 dark:text-zinc-100"
      aria-hidden="true"
    >
      <path
        d="M8.5 3.2 L4.8 6 H2.2 V10 H4.8 L8.5 12.8 Z"
        fill="currentColor"
      />
      {playing ? (
        <>
          <path
            d="M11 5.7 C11.9 6.6 11.9 9.4 11 10.3"
            className="origin-center animate-pulse"
          />
          <path
            d="M13 4 C14.6 5.6 14.6 10.4 13 12"
            className="origin-center animate-pulse opacity-60"
          />
        </>
      ) : (
        <path d="M11 5.7 C11.9 6.6 11.9 9.4 11 10.3" className="opacity-50" />
      )}
    </svg>
  );
}
