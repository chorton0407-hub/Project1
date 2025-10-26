export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const r = await prisma.$queryRaw`SELECT 1::int AS ok`;
    return NextResponse.json({ ok: true, db: r }, { status: 200 });
  } catch (e: any) {
    console.error("DB connectivity error:", e);
    return NextResponse.json({ error: e?.code || e?.message || "DB error" }, { status: 500 });
  }
}
