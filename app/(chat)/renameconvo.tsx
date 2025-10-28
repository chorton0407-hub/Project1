"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function RenameConversationInline({
  id,
  currentTitle,
}: {
  id: string;
  currentTitle: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [pending, startTransition] = useTransition();

  async function save() {
    const body = { title: title.trim() || "Untitled chat" };
    const r = await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j?.error || "Rename failed");
      return;
    }
    setEditing(false);
    
    startTransition(() => router.refresh());
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs text-neutral-500 hover:text-neutral-700"
        title="Rename"
      >
        ✎
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-28 text-xs border border-sky-200 rounded px-1 py-0.5"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <button
        onClick={save}
        className="text-xs text-sky-700 hover:underline"
        disabled={pending}
      >
        Save
      </button>
      <button
        onClick={() => { setTitle(currentTitle); setEditing(false); }}
        className="text-xs text-neutral-500 hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}