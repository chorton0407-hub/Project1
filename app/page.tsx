import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import Link from "next/link";

export default function Home() {
  return (
    <section className="py-16">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Bubble chat</h1> 
      <p className="text-neutral-600 mb-8">Sign in to start chatting.</p>
      <div className="flex gap-3">
        <a className="px-4 py-2 rounded-xl bg-sky-600 text-white" href="/login">Login</a>
        <a className="px-4 py-2 rounded-xl bg-white text-sky-700 border border-sky-200" href="/register">Register</a>
      </div>
    </section>
  );
}