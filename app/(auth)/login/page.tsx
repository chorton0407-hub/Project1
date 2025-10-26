"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();                
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,                
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);              
      return;
    }
    router.push("/conversation");     
  }

  return (
    <div className="max-w-sm mx-auto pt-24">
      <h1 className="text-2xl mb-6">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full p-2 bg-neutral-800"
               value={email} onChange={(e)=>setEmail(e.target.value)}
               placeholder="Email" />
        <input className="w-full p-2 bg-neutral-800" type="password"
               value={password} onChange={(e)=>setPassword(e.target.value)}
               placeholder="Password" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={loading} className="w-full p-2 bg-white text-black disabled:opacity-60">
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
