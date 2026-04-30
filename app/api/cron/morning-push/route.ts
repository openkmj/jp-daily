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
    title: "오늘의 일본어 표현",
    body: "탭해서 오늘 학습을 시작해요.",
    url: "/",
  });
  return NextResponse.json({ ok: true, ...result });
}
