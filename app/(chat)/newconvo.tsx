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
      const data = await r.json();
      if (r.ok && data?.id) router.push(`/conversation/${data.id}`);
      else alert(data?.error || "Could not create conversation");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={create}
      disabled={busy}
      className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60"
    >
      {busy ? "Creating…" : "New conversation"}
    </button>
  );
}