"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "오늘", icon: "✺" },
  { href: "/review", label: "복습", icon: "↻" },
  { href: "/library", label: "라이브러리", icon: "≡" },
  { href: "/settings", label: "설정", icon: "⚙" },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex w-full max-w-xl">
        {TABS.map((t) => {
          const active =
            t.href === "/"
              ? pathname === "/"
              : t.href === "/library"
                ? pathname.startsWith("/library") ||
                  pathname.startsWith("/lessons/")
                : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition ${
                  active
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-400"
                }`}
              >
                <span className="text-lg leading-none">{t.icon}</span>
                <span
                  className={`tracking-wide ${active ? "font-semibold" : ""}`}
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
