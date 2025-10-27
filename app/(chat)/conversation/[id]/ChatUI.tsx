"use client";

import { useState } from "react";

type Message = { id: string; role: "user" | "assistant"; content: string; createdAt: string };

export default function ChatUI({
  conversationId,
  initialMessages = [],
}: {
  conversationId: string;
  initialMessages?: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!input.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to send");
      }
      const msg = (await res.json()) as Message;
      setMessages((m) => [...m, msg]);
      setInput("");
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[70%] p-2 rounded-lg ${m.role === "user" ? "bg-blue-600 self-end" : "bg-neutral-800"}`}>
            <div className="whitespace-pre-wrap text-sm">{m.content}</div>
            <div className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-neutral-800">
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 bg-neutral-800 rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={(e) => (e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), send()) : null)}
          />
          <button
            className="px-3 py-2 bg-white text-black rounded disabled:opacity-60"
            onClick={send}
            disabled={sending || !input.trim()}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}