"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Conversation({ params }: { params: { id: string } }) {
  const { id } = params;
  const [messages, setMessages] = useState<
    { id?: string; role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) setMessages(await res.json());
    })();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    const optimistic = { role: "user" as const, content: text };
    setMessages((m) => [...m, optimistic, { role: "assistant", content: "" }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, message: text }),
    });

    if (!res.ok || !res.body) {
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: "assistant", content: "(error)" },
      ]);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantIdx = -1;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n\n")) {
        if (!line.startsWith("event:")) continue;
        const [eventLine, dataLine] = line.split("\n");
        const event = eventLine.replace("event: ", "").trim();
        const data = JSON.parse((dataLine || "").replace("data: ", ""));
        if (event === "delta") {
          setMessages((m) => {
            const copy = [...m];
            if (assistantIdx === -1) assistantIdx = copy.length - 1;
            copy[assistantIdx] = {
              ...copy[assistantIdx],
              content: copy[assistantIdx].content + data.content,
            };
            return copy;
          });
        }
      }
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b p-4">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to conversations
        </Link>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`p-3 rounded ${
              msg.role === "user"
                ? "bg-blue-100 ml-auto max-w-md"
                : "bg-gray-100 mr-auto max-w-md"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}
