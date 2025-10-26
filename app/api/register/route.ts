export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, name, passwordHash } });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (e: any) {
  
    const code = e?.code;
    if (code === "P2002") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    if (code === "P1001") {
      return NextResponse.json({ error: "Cannot reach database (P1001)" }, { status: 503 });
    }
    console.error("POST /api/register error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
