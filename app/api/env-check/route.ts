export const runtime = "nodejs";
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GOOGLE_API_KEY || "";
  const preview = key ? `${key.slice(0,4)}…${key.slice(-4)}` : "(missing)";
  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV,     
    vercelUrl: process.env.VERCEL_URL,
    nextauthUrl: process.env.NEXTAUTH_URL,
    hasGoogleKey: Boolean(key && key.trim()),
    googleKeyLen: key.length,
    googleKeyPreview: preview,
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    node: process.version,
  });
}