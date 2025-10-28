export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    if (!userId) return NextResponse.json({ error: "User id missing" }, { status: 400 });


    const convo = await prisma.conversation.findFirst({
      where: { id: params.id, userId },
      select: { id: true },
    });
    if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.message.deleteMany({ where: { conversationId: params.id } });
    await prisma.conversation.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/conversations/[id] error:", e?.message || e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}