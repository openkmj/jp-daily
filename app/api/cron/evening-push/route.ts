import { NextResponse } from "next/server";
import { broadcast } from "@/lib/send-push";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await broadcast({
    title: "오늘 배운 거 복습",
    body: "랜덤 10개 가볍게 풀어볼까요?",
    url: "/review",
  });
  return NextResponse.json({ ok: true, ...result });
}
