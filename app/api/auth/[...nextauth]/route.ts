export const runtime = "nodejs";

import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
// import { authOptions } from "@/lib/auth";

const authOptions: NextAuthOptions = {
  providers: [],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
