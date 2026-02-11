// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { UserRole } from "../lib/utils/auth";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    id?: string;
  }

  interface Session {
    user?: {
      id?: string;
      role?: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    id?: string;
  }
}