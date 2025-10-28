export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let userId = (session.user as any).id as string | undefined;
    if (!userId && session.user.email) {
      const u = await prisma.user.findUnique({
        where: { email: session.user.email.toLowerCase() },
        select: { id: true },
      });
      if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });
      userId = u.id;
    }

    const convo = await prisma.conversation.create({
      data: { userId: userId!, title: "New chat" },
      select: { id: true, title: true },
    });

    return NextResponse.json({ id: convo.id, title: convo.title }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/conversations error:", e?.message || e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}