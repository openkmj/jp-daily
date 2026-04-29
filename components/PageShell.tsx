import type { ReactNode } from "react";

export function PageShell({
  children,
  gap = 6,
}: {
  children: ReactNode;
  gap?: 5 | 6;
}) {
  return (
    <main
      className={`mx-auto flex w-full max-w-xl flex-col px-4 pt-6 ${
        gap === 5 ? "gap-5" : "gap-6"
      }`}
      style={{
        minHeight: "100dvh",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 76px)",
      }}
    >
      {children}
    </main>
  );
}
