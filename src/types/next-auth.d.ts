import "next-auth";
import "next-auth/jwt";
import type { AdminPermission } from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      permissions: AdminPermission[];
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: string;
    permissions?: AdminPermission[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    permissions?: AdminPermission[];
  }
}
