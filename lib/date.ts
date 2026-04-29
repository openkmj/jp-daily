const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKst(date: Date): Date {
  return new Date(date.getTime() + KST_OFFSET_MS);
}

export function todayKst(date: Date = new Date()): string {
  const kst = toKst(date);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function currentMonthKst(date: Date = new Date()): string {
  return todayKst(date).slice(0, 7);
}

export function monthOf(date: string): string {
  return date.slice(0, 7);
}

export function prevMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

export function kstClock(date: Date = new Date()): { h: number; m: number } {
  const kst = toKst(date);
  return { h: kst.getUTCHours(), m: kst.getUTCMinutes() };
}

export function isReviewWindowKst(date: Date = new Date()): boolean {
  const { h, m } = kstClock(date);
  return (h === 22 && m >= 30) || h === 23;
}

export function formatKstDateLabel(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}.${m}.${d}`;
}

export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `${y}.${m}`;
}
