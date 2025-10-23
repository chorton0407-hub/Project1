import dynamic from "next/dynamic";

const ChatIndexClient = dynamic(() => import("@/components/ChatIndexClient"), {
  ssr: false,
});

export default function ChatIndex() {
  return <ChatIndexClient />;
}