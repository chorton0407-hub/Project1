import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConversationIndex() {
  // relative URL so cookies/sessions are sent
  const res = await fetch("/api/conversations", {
    method: "POST",
    cache: "no-store",
  });

  if (!res.ok) {
    // not logged in or server error
    redirect("/login");
  }

  const { id } = await res.json();
  redirect(`/conversation/${id}`);
}