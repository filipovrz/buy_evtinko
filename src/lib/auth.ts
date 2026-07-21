import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { verifyTotpCode } from "./totp";
import { prisma } from "./prisma";
import type { Adapter } from "next-auth/adapters";
import {
  type AdminPermission,
  hasPermission,
  isStaffRole,
  parsePermissions,
} from "./permissions";

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

      if (!user.emailVerified && !isStaffRole(user.role)) {
        throw new Error("EMAIL_NOT_VERIFIED");
      }

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
        permissions: parsePermissions(user.permissions),
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

async function loadStaffClaims(userId: string) {
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  return {
    role: dbUser?.role || "CUSTOMER",
    permissions: parsePermissions(dbUser?.permissions),
  };
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
        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              role: existing.role || "CUSTOMER",
              emailVerified: existing.emailVerified || new Date(),
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      if (token.id) {
        const claims = await loadStaffClaims(token.id as string);
        token.role = claims.role;
        token.permissions = claims.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "CUSTOMER";
        session.user.permissions = (token.permissions as AdminPermission[]) || [];
      }
      return session;
    },
  },
};

export function getSession() {
  return getServerSession(authOptions);
}

/** Any staff (ADMIN or SUPERADMIN) may enter /admin */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || !isStaffRole(session.user.role)) {
    return null;
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireAdmin();
  if (!session || session.user.role !== "SUPERADMIN") return null;
  return session;
}

export async function requirePermission(key: AdminPermission) {
  const session = await requireAdmin();
  if (!session) return null;
  if (
    !hasPermission(session.user.role, session.user.permissions, key)
  ) {
    return null;
  }
  return session;
}

export function sessionHasPermission(
  session: { user: { role: string; permissions?: AdminPermission[] } } | null,
  key: AdminPermission
) {
  if (!session?.user) return false;
  return hasPermission(session.user.role, session.user.permissions, key);
}
