export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ChatUI from "./ChatUI";

export default async function ConversationPage({ params }: { params: { id: string } }) {
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

  // Pass initial messages to the client component
  return (
    <div className="h-full">
      <ChatUI conversationId={convo.id} initialMessages={convo.messages as any} />
    </div>
  );
}