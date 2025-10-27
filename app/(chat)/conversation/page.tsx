export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ConversationIndex() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  let userId = (session.user as any).id as string | undefined;

  if (!userId) {
    const email = session.user.email?.trim().toLowerCase();
    if (!email) redirect("/login");

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) redirect("/login");
    userId = user.id;
  }

  const convo = await prisma.conversation.create({
    data: { userId }, 
    select: { id: true },
  });

  redirect(`/conversation/${convo.id}`);
}