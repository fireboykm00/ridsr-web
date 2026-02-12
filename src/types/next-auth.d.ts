// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { UserRole, RwandaDistrictType, RwandaProvinceType } from "./index";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    id?: string;
    district?: RwandaDistrictType;
    province?: RwandaProvinceType;
    workerId?: string;
    facilityId?: string;
    facilityName?: string;
  }

  interface Session {
    user?: {
      id?: string;
      role?: UserRole;
      district?: RwandaDistrictType;
      province?: RwandaProvinceType;
      workerId?: string;
      facilityId?: string;
      facilityName?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    id?: string;
    district?: RwandaDistrictType;
    province?: RwandaProvinceType;
    workerId?: string;
    facilityId?: string;
    facilityName?: string;
  }
}