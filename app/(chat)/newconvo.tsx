"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewConversationButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create() {
    try {
      setBusy(true);
      const r = await fetch("/api/conversations", { method: "POST" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.id) {
        console.error("New conversation failed:", data);
        alert(data?.error || "Could not create conversation");
        return;
      }
      // Refresh list first so it appears immediately, then navigate
      router.refresh();
      router.push(`/conversation/${data.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={create}
      disabled={busy}
      className="px-2 py-1.5 text-xs rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
      title="New conversation"
    >
      {busy ? "…" : "New"}
    </button>
  );
}