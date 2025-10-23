"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatIndexClient() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) return router.replace("/login");
        const data = await res.json();
        const id = (data?.id ?? data?.conversation?.id) as string | undefined;
        if (id && !cancelled) router.replace(`/conversation/${id}`);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return <div className="p-6 text-sm text-neutral-400">Creating chat…</div>;
}
