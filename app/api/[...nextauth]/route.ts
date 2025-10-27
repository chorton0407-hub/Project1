import type { NextRequest } from "next/server";
export async function GET(req: NextRequest) {
  console.log("[NextAuth] GET", req.nextUrl.pathname);
}
export async function POST(req: NextRequest) {
  console.log("[NextAuth] POST", req.nextUrl.pathname);
}