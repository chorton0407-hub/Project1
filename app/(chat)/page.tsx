"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatIndex() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/conversations", { method: "POST" });
      if (!res.ok) return router.replace("/login");
      const { id } = await res.json();
      if (!cancelled) router.replace(`/conversation/${id}`);
    })();
    return () => { cancelled = true; };
  }, [router]);

  return <div className="p-6 text-sm text-neutral-400">Creating chat…</div>;
}