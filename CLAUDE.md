@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Versions to be careful with

- Next.js 16.2.4 (App Router) — see `AGENTS.md`. APIs and conventions differ from older Next.js; consult `node_modules/next/dist/docs/` before writing routing, caching, params, or middleware code.
- React 19.2.4. Tailwind CSS v4 (PostCSS plugin only — no `tailwind.config.*`). ESLint v9 flat config (`eslint.config.mjs`).
- Project config lives in `vercel.ts` (not `vercel.json`), exported via `@vercel/config/v1`.

## Commands

- `npm run dev` — Next dev server (no service worker; PWA only registers in production builds).
- `npm run build` / `npm run start` — production build + serve.
- `npm run lint` — ESLint (flat config). There is no test framework configured.
- `node scripts/upload-sample.mjs <month-archive.json>` — upload a `MonthlyArchive` JSON to Vercel Blob at `lessons/<month>.json` (overwrites). Loads `BLOB_READ_WRITE_TOKEN` from `.env.local`.
- `node scripts/reset-blob.mjs` — wipes everything under `lessons/` in Blob, then re-uploads `scripts/sample-2026-04.json`. Destructive.

## Architecture

This is a Korean-language PWA for daily Japanese lessons. Three top-level tabs (`BottomTabs`): `/` (today), `/review` (random sentences from recent months), `/library` (browse past dates → `/lessons/[date]`).

### Data model and storage

Lessons are not stored in a database. They are JSON `MonthlyArchive` blobs in **public** Vercel Blob storage at the path `lessons/YYYY-MM.json`. Schema is in `lib/schema.ts`:

- `MonthlyArchive { version: 1, month: "YYYY-MM", lessons: Record<"YYYY-MM-DD", RichLesson> }`
- `RichLesson { date, sentences: RichSentence[] }`
- `RichSentence { tokens: Token[], meaning, keyPoints?, audio? }` — `tokens` are the per-word jp/pron/meaning triplets the UI lays out side-by-side.

`lib/blob.ts` is the read path. Notably:
- The blob host is **derived from `BLOB_READ_WRITE_TOKEN`** by parsing the store ID out of the token (`vercel_blob_rw_<storeId>_…`) and constructing `https://<storeId>.public.blob.vercel-storage.com`. There is no separate base-URL env var. If you change how blobs are accessed, update `getBlobBase()`.
- Reads go through `fetch(url, { next: { revalidate: 3600 } })` so Next.js handles ISR caching of the monthly archive. `getMonthlyArchive` is also wrapped in React `cache()` so a single render only fetches each month once.
- `getMonthsBack(n)` walks backwards from the current KST month and stops at the first missing archive.

### Time handling — everything is KST

`lib/date.ts` is the single source of truth. All "today" / "current month" logic uses `todayKst()` / `currentMonthKst()` (UTC + 9h, then formatted). Date strings are always `YYYY-MM-DD`, month strings `YYYY-MM`. Pages compare dates as strings (lexicographic works because of zero-padding) — e.g. `app/library/page.tsx` filters `d <= today`. Don't introduce `new Date()`-based comparisons that would re-introduce a timezone bug.

### Pages and rendering

All four pages (`app/page.tsx`, `app/review/page.tsx`, `app/library/page.tsx`, `app/lessons/[date]/page.tsx`) are async Server Components that fetch from Blob, then pass data into a small `"use client"` component for interactivity (`TokenizedLessonView`, `ReviewSession`, `LibraryList`). Keep that split: data fetching stays on the server, state (revealed / index / shuffled queue) stays in the client component.

`app/lessons/[date]/page.tsx` uses the Next 16 async-params signature (`params: Promise<{ date: string }>`) — `await params` before use. It validates the date format and rejects future dates via `notFound()`.

### PWA shell

- `app/manifest.webmanifest/route.ts` serves the manifest as a static JSON route (`dynamic = "force-static"`).
- `public/sw.js` is the service worker: cache-first for static, network-first with cache fallback for `/api/*`, fall back to `/` offline. Cache name is versioned (`jp-daily-v1`) — bump it when changing cached assets.
- `components/PwaRegister.tsx` only registers the SW when `NODE_ENV === "production"`, so dev never hits stale caches.

### Styling conventions

Tailwind v4 utility classes only; dark mode via `dark:` variants throughout. Layout uses a fixed bottom nav (`BottomTabs`) so pages live inside `PageShell` with bottom padding for `env(safe-area-inset-bottom)`. UI copy is Korean.

## Environment

`BLOB_READ_WRITE_TOKEN` (Vercel Blob, read-write) is required for both runtime reads (URL is parsed out of it) and the upload scripts. Stored in `.env.local` for local dev; the upload scripts parse `.env.local` themselves since they run outside Next.
