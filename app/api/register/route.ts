export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    const emailNorm = String(email || "").trim().toLowerCase();
    if (!emailNorm || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const exists = await prisma.user.findFirst({
      where: { email: { equals: emailNorm, mode: "insensitive" } },
    });
    if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email: emailNorm, name, passwordHash } });
    console.log("REGISTER created", { id: user.id, email: user.email }); // check Vercel > Functions
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/register error:", e);
    return NextResponse.json({ error: e?.code || e?.message || "Server error" }, { status: 500 });
  }
}