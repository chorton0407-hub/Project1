import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const credsSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        try {
          const parsed = credsSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;

      
          return { id: user.id, email: user.email, name: user.name ?? user.email };
        } catch (e: any) {
          console.error("[authorize] error:", e?.code || e?.message || e);
         
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) token.id = (user as any).id; return token; },
    async session({ session, token }) { if (session.user && token?.id) (session.user as any).id = token.id as string; return session; },
  },
};