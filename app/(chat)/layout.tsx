export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NewConversationButton from "./newconvo";
import DeleteConversationButton from "./deleteconvo";
import Link from "next/link";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id ?? null;

  const conversations = userId
    ? await prisma.conversation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true },
      })
    : [];

  return (
    <div className="min-h-screen bg-sky-50 text-neutral-900">
      <header className="border-b border-sky-200 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Bubble chat</h1>{/* ⬅ renamed */}
          <div className="flex items-center gap-3">
            <NewConversationButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-4 grid grid-cols-12 gap-4">
        <aside className="col-span-4 md:col-span-3 lg:col-span-3 bg-white rounded-2xl shadow p-3 space-y-2">
          <div className="text-sm font-medium text-neutral-600 mb-2">Your conversations</div>
          <div className="space-y-1">
            {conversations.map(c => (
              <div key={c.id} className="group flex items-center justify-between gap-2">
                <Link
                  href={`/conversation/${c.id}`}
                  className="truncate py-2 px-2 rounded hover:bg-sky-50 flex-1"
                >
                  {c.title || "Untitled chat"}
                </Link>
                <DeleteConversationButton conversationId={c.id} />
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="text-sm text-neutral-500">No chats yet.</div>
            )}
          </div>
        </aside>

        <main className="col-span-8 md:col-span-9 lg:col-span-9">
          <div className="bg-white rounded-2xl shadow p-0 min-h-[70vh]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}