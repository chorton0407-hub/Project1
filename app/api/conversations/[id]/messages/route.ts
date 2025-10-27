export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    
    const convo = await prisma.conversation.findFirst({
      where: { id: params.id, userId: (session.user as any).id },
      select: { id: true },
    });
    if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const msg = await prisma.message.create({
      data: {
        conversationId: params.id,
        role: "user",
        content,
      },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    return NextResponse.json(msg, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/conversations/[id]/messages error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}