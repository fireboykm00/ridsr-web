// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { User, UserRole, RWANDA_DISTRICTS, RWANDA_PROVINCES } from "./index";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    id?: string;
    district?: RWANDA_DISTRICTS;
    province?: RWANDA_PROVINCES;
    workerId?: string;
    facilityId?: string;
  }

  interface Session {
    user?: {
      id?: string;
      role?: UserRole;
      district: RWANDA_DISTRICTS;
      province: RWANDA_PROVINCES;
      workerId?: string;
      facilityId: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    id?: string;
    district?: RWANDA_DISTRICTS;
    province?: RWANDA_PROVINCES;
    workerId?: string;
    facilityId?: string;
  }
}