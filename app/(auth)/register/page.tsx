"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const j = await res.json();
      setError(j.error || "Failed");
      return;
    }
    router.push("/login");
  }

  return (
    <div className="max-w-sm mx-auto pt-24">
      <h1 className="text-2xl mb-6">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full p-2 bg-neutral-800"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
        />
        <input
          className="w-full p-2 bg-neutral-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="w-full p-2 bg-neutral-800"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8)"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full p-2 bg-white text-black">Register</button>
      </form>
    </div>
  );
}
