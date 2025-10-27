export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key || !key.trim()) {
    console.error("[ai] GOOGLE_API_KEY missing at runtime");
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(key);
  const MODEL_NAME = "gemini-1.5-flash";

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    const convo = await prisma.conversation.findFirst({
      where: { id: params.id, userId: (session.user as any).id },
      select: { id: true },
    });
    if (!convo) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const userMsg = await prisma.message.create({
      data: { conversationId: convo.id, role: "user", content },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    const prior = await prisma.message.findMany({
      where: { conversationId: convo.id },
      orderBy: { createdAt: "asc" },
      take: 30,
      select: { role: true, content: true },
    });

    const history = prior.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const genConfig = {
      temperature: 0.6,
      maxOutputTokens: 512,
    };

    const chat = model.startChat({ generationConfig: genConfig, history });
    const geminiRes = await chat.sendMessage(content);

    let text = "";
    try {
      text = geminiRes.response.text?.() ?? "";
    } catch {
      text =
        (geminiRes as any)?.response?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p?.text ?? "")
          .join("") ?? "";
    }

    if (!text || !text.trim()) {
      console.warn("[gemini] empty/blocked response");
      text =
        "Hmm, I couldn’t generate a response just now. Try rephrasing or ask another question.";
    }

    const assistantMsg = await prisma.message.create({
      data: { conversationId: convo.id, role: "assistant", content: text },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    return NextResponse.json(assistantMsg, { status: 201 });
  } catch (e: any) {
    console.error(
      "POST /api/conversations/[id]/messages error:",
      e?.status || e?.code,
      e?.message || e
    );
    const msg =
      e?.status === 429
        ? "The AI is rate-limited right now. Please try again in a moment."
        : e?.message || "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
