export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import NewConversationButton from "./newconvo"; 
import DeleteConversationButton from "./deleteconvo";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id ?? null;

  const conversations = userId
    ? await prisma.conversation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true },
      })
    : [];

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-4 md:col-span-3">
        <div className="bg-white rounded-2xl shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-neutral-700">Your conversations</div>
            <NewConversationButton /> {/* <-- Button shows here */}
          </div>
          <div className="space-y-1">
            {conversations.map(c => (
              <div key={c.id} className="group flex items-center justify-between gap-2">
                <Link href={`/conversation/${c.id}`} className="truncate py-1">
                  {c.title || "Untitled chat"}
                </Link>
                <DeleteConversationButton conversationId={c.id} />
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="text-sm text-neutral-500">No chats yet.</div>
            )}
          </div>
        </div>
      </aside>
      <main className="col-span-8 md:col-span-9">
        <div className="bg-white rounded-2xl shadow min-h-[70vh]">{children}</div>
      </main>
    </div>
  );
}