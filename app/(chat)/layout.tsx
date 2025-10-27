import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const conversations = userId
    ? await prisma.conversation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true },
      })
    : [];

  return (
    <div className="flex">
      <aside className="w-64 p-4 border-r border-neutral-800">
        {conversations.map(c => (
          <a key={c.id} href={`/conversation/${c.id}`} className="block py-1 truncate">
            {c.title ?? "Untitled chat"}
          </a>
        ))}
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}