# jp-daily

A Korean-language PWA for daily Japanese practice. One small lesson per day — 3 sentences broken into per-token (jp / 한글 발음 / 뜻) cards with TTS audio, plus a random review across recent months and a flat by-date library. Personal use, phone-first.

Four bottom tabs: `/` (오늘), `/review` (복습), `/library` (라이브러리), `/settings` (설정).

## Stack

- Next.js 16 (App Router, Turbopack), React 19, Tailwind v4
- Vercel Blob for monthly lesson archives + per-sentence audio (read-only at runtime)
- Vercel Cron + Web Push for morning study / evening review reminders
- TypeScript, ESLint flat config

## Architecture

- `app/` — server components fetch a `MonthlyArchive` from Blob and pass into thin client components for state (`TokenizedLessonView`, `ReviewSession`, `LibraryList`). `SentenceCard` overlays an `AudioPlayButton` when `sentence.audio` is set.
- `lib/blob.ts` — read path. `getMonthlyArchive(month)` is `cache()`-memoized per render and uses `next: { revalidate: 3600 }`. The Blob host is derived from `BLOB_READ_WRITE_TOKEN` (parses the store ID), so no separate base URL env. No `list()` calls on the read path.
- `lib/date.ts` — single source of truth for KST. All date strings are `YYYY-MM-DD`, months are `YYYY-MM`. Lex compare works.
- `public/sw.js` — service worker: network-first for navigations and `/api/*`, cache-first for static, plus push event handler. PWA registers only in production builds. Cache name is versioned (`jp-daily-vN`) — bump it when changing cached assets.
- `lib/push.ts` + `lib/send-push.ts` — push subscriptions persist as a single JSON file in Blob (`push/subscriptions.json`). Cron handlers fan out via `web-push` and prune dead endpoints (404/410).
- `vercel.ts` — pins the framework and registers two crons (09:30 KST morning push, 22:30 KST evening push).
- Audio files live in the same Blob store; URLs are embedded into the archive's `sentence.audio` and played client-side via `<audio>`.

## Data model

```ts
type Token = { jp: string; pron: string; meaning: string };
type RichSentence = {
  tokens: Token[];
  meaning: string;
  keyPoints?: string[];
  audio?: string;
};
type RichLesson = { date: string; sentences: RichSentence[] };
type MonthlyArchive = {
  version: 1;
  month: string;
  lessons: Record<string, RichLesson>;
};
```

Stored at `lessons/YYYY-MM.json` in Vercel Blob. Schema in `lib/schema.ts`.

## Local development

```bash
npm install
vercel link                  # connect to the existing project
vercel env pull .env.local   # pulls BLOB_READ_WRITE_TOKEN, VAPID_*, CRON_SECRET
npm run dev
```

`npm run lint` / `npm run build` / `npm run start` as usual. There is no test suite.

## Content

Archives are generated offline, not at runtime, and uploaded to Blob via local scripts (`scripts/`). Drafts live in `content/drafts/` and are gitignored; `scripts/sample-2026-04.json` is checked in as a stylistic seed and schema example. `content/curriculum.yaml` and `content/prompts/` capture the writer plan and prompts.

## Push notifications

Web Push via VAPID, single subscription file in Blob (multi-device append, dedupe by endpoint). The settings tab (`/settings`) registers / unsubscribes the current device. iOS only delivers push to PWAs added to the home screen.

Cron schedules (in UTC):

| Schedule         | Endpoint                    | KST    |
| ---------------- | --------------------------- | ------ |
| `30 0 * * *`     | `/api/cron/morning-push`    | 09:30  |
| `30 13 * * *`    | `/api/cron/evening-push`    | 22:30  |

Both routes require `Authorization: Bearer ${CRON_SECRET}` and call `lib/send-push.ts:broadcast`. To test manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://jp-daily.vercel.app/api/cron/morning-push
```

## Environment

| Variable                          | Where         | Purpose                                        |
| --------------------------------- | ------------- | ---------------------------------------------- |
| `BLOB_READ_WRITE_TOKEN`           | server + script | Blob auth + Blob host derivation              |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`    | client + server | Subscribe button, server signs notifications  |
| `VAPID_PRIVATE_KEY`               | server        | Sign push payloads                             |
| `VAPID_SUBJECT`                   | server        | `mailto:` or `https:` URL for VAPID            |
| `CRON_SECRET`                     | server        | Auth bearer for cron-triggered routes          |

## Deploy

```bash
vercel --prod
```

Production is `https://jp-daily.vercel.app`.
