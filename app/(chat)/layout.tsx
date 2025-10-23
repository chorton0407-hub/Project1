import { ReactNode } from "react";
import Link from "next/link";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[260px_1fr] min-h-screen">
      <aside className="border-r border-neutral-800 p-4 space-y-4">
        <Link href="/conversation" className="block p-2 bg-neutral-800 text-sm">
          + New chat
        </Link>
        <Conversations />
      </aside>
      <main>{children}</main>
    </div>
  );
}

async function Conversations() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/conversations`,
    { cache: "no-store" }
  );
  if (!res.ok)
    return (
      <div className="text-sm text-neutral-400">Sign in to see chats.</div>
    );
  const list: { id: string; title: string }[] = await res.json();
  return (
    <ul className="space-y-1">
      {list.map((c) => (
        <li key={c.id}>
          <Link
            className="block p-2 hover:bg-neutral-800 text-sm truncate"
            href={`/conversation/${c.id}`}
          >
            {c.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
