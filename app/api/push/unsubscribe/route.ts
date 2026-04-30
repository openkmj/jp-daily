import { NextResponse } from "next/server";
import { removeSubscription } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const endpoint = (body as { endpoint?: string })?.endpoint;
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint required" }, { status: 400 });
  }
  await removeSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
