export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: "No GOOGLE_API_KEY" }, { status: 500 });

  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(key)
  );
  const text = await r.text();
  return NextResponse.json({ ok: r.ok, status: r.status, body: text.slice(0, 500) });
}