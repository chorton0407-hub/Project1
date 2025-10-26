export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({ ok: true, echo: body }, { status: 201 });
  } catch (e: any) {
    console.error("register noop error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
