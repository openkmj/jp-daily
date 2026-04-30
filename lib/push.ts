import { put, list } from "@vercel/blob";

const SUBS_KEY = "push/subscriptions.json";

export type PushSub = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type SubsFile = {
  version: 1;
  subscriptions: PushSub[];
};

const EMPTY: SubsFile = { version: 1, subscriptions: [] };

async function findUrl(pathname: string): Promise<string | null> {
  const res = await list({ prefix: pathname, limit: 5 });
  return res.blobs.find((b) => b.pathname === pathname)?.url ?? null;
}

async function readSubs(): Promise<SubsFile> {
  const url = await findUrl(SUBS_KEY);
  if (!url) return { ...EMPTY };
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return { ...EMPTY };
  try {
    return (await r.json()) as SubsFile;
  } catch {
    return { ...EMPTY };
  }
}

async function writeSubs(file: SubsFile): Promise<void> {
  await put(SUBS_KEY, JSON.stringify(file, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getSubscriptions(): Promise<PushSub[]> {
  const file = await readSubs();
  return file.subscriptions;
}

export async function addSubscription(sub: PushSub): Promise<void> {
  const file = await readSubs();
  if (file.subscriptions.some((s) => s.endpoint === sub.endpoint)) return;
  file.subscriptions.push(sub);
  await writeSubs(file);
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const file = await readSubs();
  const next = file.subscriptions.filter((s) => s.endpoint !== endpoint);
  if (next.length !== file.subscriptions.length) {
    await writeSubs({ version: 1, subscriptions: next });
  }
}

export async function pruneSubscriptions(deadEndpoints: string[]): Promise<void> {
  if (deadEndpoints.length === 0) return;
  const file = await readSubs();
  const next = file.subscriptions.filter(
    (s) => !deadEndpoints.includes(s.endpoint),
  );
  if (next.length !== file.subscriptions.length) {
    await writeSubs({ version: 1, subscriptions: next });
  }
}
