import { cache } from "react";
import type { MonthlyArchive, RichLesson } from "./schema";
import { currentMonthKst, monthOf, prevMonth } from "./date";

const REVALIDATE_SECONDS = 3600;

function getBlobBase(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN not set");
  }
  const m = token.match(/^vercel_blob_rw_([^_]+)_/);
  if (!m) {
    throw new Error("Invalid BLOB_READ_WRITE_TOKEN format");
  }
  return `https://${m[1]}.public.blob.vercel-storage.com`;
}

export const getMonthlyArchive = cache(
  async (month: string): Promise<MonthlyArchive | null> => {
    const url = `${getBlobBase()}/lessons/${month}.json`;
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    try {
      return (await res.json()) as MonthlyArchive;
    } catch {
      return null;
    }
  },
);

export async function getLessonByDate(
  date: string,
): Promise<RichLesson | null> {
  const archive = await getMonthlyArchive(monthOf(date));
  return archive?.lessons[date] ?? null;
}

export async function getMonthsBack(
  count: number,
  fromMonth: string = currentMonthKst(),
): Promise<MonthlyArchive[]> {
  const out: MonthlyArchive[] = [];
  let cursor = fromMonth;
  for (let i = 0; i < count; i++) {
    const archive = await getMonthlyArchive(cursor);
    if (!archive) break;
    out.push(archive);
    cursor = prevMonth(cursor);
  }
  return out;
}
