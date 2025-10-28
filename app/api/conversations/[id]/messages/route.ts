export const runtime = "nodejs";          
export const dynamic = "force-dynamic";   

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request, { params }: { params: { id: string } }) {
 
  const rawKey = process.env.GOOGLE_API_KEY?.trim();
  if (!rawKey) {
    console.error("[ai] GOOGLE_API_KEY missing at runtime");

    return NextResponse.json(
      { error: "AI not configured", diag: { hasKey: false, env: process.env.VERCEL_ENV } },
      { status: 500 }
    );
  }


  try {
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(rawKey)
    );
    if (!r.ok) {
      const t = await r.text();
      console.error("[ai] smoketest failed:", r.status, t.slice(0, 300));
      return NextResponse.json(
        { error: "AI not configured", diag: { hasKey: true, status: r.status } },
        { status: 500 }
      );
    }
  } catch (e: any) {
    console.error("[ai] smoketest error:", e?.message || e);
    return NextResponse.json(
      { error: "AI not configured", diag: { hasKey: true, status: "fetch-error" } },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(rawKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const convo = await prisma.conversation.findFirst({
      where: { id: params.id, userId },
      select: { id: true },
    });
    if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.message.create({
      data: { conversationId: convo.id, role: "user", content },
    });

    const prior = await prisma.message.findMany({
      where: { conversationId: convo.id },
      orderBy: { createdAt: "asc" },
      take: 30,
      select: { role: true, content: true },
    });
    const history = prior.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      generationConfig: { temperature: 0.6, maxOutputTokens: 512 },
      history,
    });

    const resp = await chat.sendMessage(content);
    let text = "";
    try { text = resp.response.text?.() ?? ""; } catch {}
    if (!text.trim()) text = "Hmm, I couldn’t generate a response just now. Try rephrasing.";

    const assistant = await prisma.message.create({
      data: { conversationId: convo.id, role: "assistant", content: text },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    return NextResponse.json(assistant, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/conversations/[id]/messages:", e?.status || e?.code, e?.message || e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}