import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChatIndex() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/conversations`,
    { method: "POST", cache: "no-store" }
  );
  if (!res.ok) redirect("/login");
  const { id } = await res.json();
  redirect(`/conversation/${id}`);
}