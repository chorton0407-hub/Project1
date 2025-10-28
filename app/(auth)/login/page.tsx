"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // prevent full-page GET submit
    setMsg(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false, // critical: do NOT navigate automatically
        email,
        password,
      });

      console.log("[login] signIn result:", res);

      if (!res) {
        setMsg("No response from auth. Check console and /api/auth/providers.");
        return;
      }
      if (res.error) {
        setMsg(
          res.error === "CredentialsSignin"
            ? "Invalid email or password."
            : res.error
        );
        return;
      }
      // Success:
      router.push("/conversation");
    } catch (err: any) {
      console.error("[login] error:", err);
      setMsg(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto pt-24">
      <h1 className="text-2xl mb-4">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full p-2 bg-neutral-800 text-white placeholder-neutral-400 rounded-md"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="w-full p-2 bg-neutral-800 text-white placeholder-neutral-400 rounded-md"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {msg && <p className="text-sm text-red-400">{msg}</p>}
        <button
          type="submit" // make sure it's a submit button
          disabled={loading}
          className="w-full p-2 bg-white text-black disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
