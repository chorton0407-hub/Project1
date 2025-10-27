export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ConversationIndex() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id as string;

  const convo = await prisma.conversation.create({
    data: { userId },
    select: { id: true },
  });

  redirect(`/conversation/${convo.id}`);
}