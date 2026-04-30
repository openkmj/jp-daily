import webpush from "web-push";
import { getSubscriptions, pruneSubscriptions, type PushSub } from "./push";

let initialized = false;
function init() {
  if (initialized) return;
  const subject = process.env.VAPID_SUBJECT;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !pub || !priv) {
    throw new Error("VAPID env vars not set");
  }
  webpush.setVapidDetails(subject, pub, priv);
  initialized = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export async function broadcast(payload: PushPayload): Promise<{
  sent: number;
  failed: number;
  total: number;
}> {
  init();
  const subs = await getSubscriptions();
  const dead: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (sub: PushSub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          dead.push(sub.endpoint);
        }
        failed++;
      }
    }),
  );

  if (dead.length > 0) {
    await pruneSubscriptions(dead);
  }
  return { sent, failed, total: subs.length };
}
