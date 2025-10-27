export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ChatUI from "../ChatUI"; // adjust import if your ChatUI path differs

export default async function MessagesPage({ params }: { params: { id: string } }) {

  const convo = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });

  if (!convo) notFound();

  return <ChatUI conversationId={convo.id} initialMessages={convo.messages as any} />;
}