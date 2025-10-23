import { redirect } from "next/navigation";

export default async function ChatIndex() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/conversations`,
    { method: "POST" }
  );
  if (!res.ok) redirect("/login");
  const { id } = await res.json();
  redirect(`/conversation/${id}`);
}
