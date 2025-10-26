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
      const res = await fetch(`/api/conversations/${id}/messages`, {
        cache: "no-store",
      });
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


    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, message: text }),
    });

    if (!res.ok || !res.body) {
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: "assistant", content: "(error contacting AI)" },
      ]);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantIndex = -1;

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
            if (assistantIndex === -1) assistantIndex = copy.length - 1;
            copy[assistantIndex].content += data.text;
            return copy;
          });
        }
      }
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <Link href="/conversation" className="underline text-sm text-neutral-400">
          + New Chat
        </Link>
        <h1 className="text-lg font-medium">Conversation</h1>
        <div />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-3xl px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-100"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input box */}
      <form onSubmit={sendMessage} className="p-4 border-t border-neutral-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 bg-neutral-800 rounded-xl"
        />
        <button
          type="submit"
          className="px-4 py-3 bg-white text-black rounded-xl hover:bg-gray-200"
        >
          Send
        </button>
      </form>
    </div>
  );
}