"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteConversationButton({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    if (!confirm("Delete this conversation?")) return;
    try {
      setBusy(true);
      const r = await fetch(`/api/conversations/${conversationId}`, { method: "DELETE" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        console.error("Delete failed:", data);
        alert(data?.error || "Could not delete");
        return;
      }
      router.refresh(); // refresh sidebar list
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={del}
      title="Delete"
      disabled={busy}
      className="px-2 py-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      ✕
    </button>
  );
}