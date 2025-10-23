import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-semibold">Gemini Chat</h1>
        {session ? (
          <Link href="/conversation" className="underline">
            Go to chat
          </Link>
        ) : (
          <div className="space-x-4">
            <Link href="/login" className="underline">
              Login
            </Link>
            <Link href="/register" className="underline">
              Register
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
