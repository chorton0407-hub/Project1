export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ConversationIndex() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const convo = await prisma.conversation.create({
    data: { userId }, // add any defaults you need
    select: { id: true },
  });

  redirect(`/conversation/${convo.id}`);
}