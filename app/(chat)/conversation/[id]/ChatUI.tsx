"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

export default function ChatUI({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages || []);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // auto-scroll on new messages
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    // optimistic user message
    const optimistic: Msg = { role: "user", content: text };
    setMessages((m) => [...m, optimistic]);
    setInput("");
    setSending(true);

    try {
      const r = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await r.json().catch(() => ({} as any));

      if (!r.ok) {
        // surface server error but keep the user's optimistic message
        console.error("[send] failed:", data);
        setMessages((m) => [...m, { role: "assistant", content: data?.error || "Server error" }]);
        return;
      }

      // server returns the assistant message; append it
      const assistantMsg: Msg = {
        id: data.id,
        role: "assistant",
        content: data.content,
        createdAt: data.createdAt,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (e) {
      console.error("[send] exception", e);
      setMessages((m) => [...m, { role: "assistant", content: "Network error." }]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-900 text-white rounded-t-2xl"
      >
        {messages.length === 0 && (
          <div className="text-sm text-neutral-400">Say hi to Bubble chat 👋</div>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id || i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={[
                  "max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap break-words",
                  isUser
                    ? "bg-sky-600 text-white"
                    : "bg-neutral-800 text-white border border-neutral-700",
                ].join(" ")}
              >
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="border-t border-neutral-800 bg-neutral-900 rounded-b-2xl p-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message Bubble chat…"
            autoFocus
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white disabled:opacity-60 hover:bg-sky-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}