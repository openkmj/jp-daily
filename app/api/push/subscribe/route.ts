import { NextResponse } from "next/server";
import { addSubscription } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const sub = (body as { subscription?: unknown })?.subscription as
    | { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
    | undefined;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json(
      { error: "invalid subscription" },
      { status: 400 },
    );
  }
  await addSubscription({
    endpoint: sub.endpoint,
    keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
  return NextResponse.json({ ok: true });
}
