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

    let userId = (session.user as any)?.id as string | undefined;
    if (!userId && session.user.email) {
      const u = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true } });
      userId = u?.id;
    }
    if (!userId) return NextResponse.json({ error: "User id missing" }, { status: 400 });

    // ownership check
    const found = await prisma.conversation.findFirst({ where: { id: params.id, userId }, select: { id: true } });
    if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // delete children then parent (works even without FK cascade)
    await prisma.message.deleteMany({ where: { conversationId: params.id } });
    await prisma.conversation.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/conversations/[id] error:", e?.message || e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let userId = (session.user as any)?.id as string | undefined;
    if (!userId && session.user.email) {
      const u = await prisma.user.findUnique({ where: { email: session.user.email.toLowerCase() }, select: { id: true } });
      userId = u?.id;
    }
    if (!userId) return NextResponse.json({ error: "User id missing" }, { status: 400 });

    const { title } = await req.json();
    const safe = (String(title ?? "")).trim().slice(0, 120) || "Untitled chat";

    const found = await prisma.conversation.findFirst({ where: { id: params.id, userId }, select: { id: true } });
    if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.conversation.update({ where: { id: params.id }, data: { title: safe } });

    return NextResponse.json({ ok: true, title: safe });
  } catch (e: any) {
    console.error("PATCH /api/conversations/[id] error:", e?.message || e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}