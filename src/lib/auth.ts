import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { verifyTotpCode } from "./totp";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      totp: { label: "2FA code", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase().trim() },
      });
      if (!user?.passwordHash) return null;
      const valid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!valid) return null;

      if (user.totpEnabled && user.totpSecret) {
        const code = String(credentials.totp || "").trim();
        if (!code || !verifyTotpCode(code, user.totpSecret)) {
          throw new Error("TWO_FACTOR_REQUIRED");
        }
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (!user.email) return false;
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (existing && !existing.role) {
          await prisma.user.update({ where: { id: existing.id }, data: { role: "CUSTOMER" } });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        token.role = dbUser?.role || (user as { role?: string }).role || "CUSTOMER";
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        token.role = dbUser?.role || "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "CUSTOMER";
      }
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}
