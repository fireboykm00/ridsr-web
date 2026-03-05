// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import { User, UserRole, RwandaDistrictType, RwandaProvinceType } from "@/types";

type AuthFailureCode =
  | "invalid_credentials"
  | "account_disabled"
  | "auth_service_error";

type GetUserResult =
  | { ok: true; user: User }
  | { ok: false; code: AuthFailureCode };

function credentialsError(code: AuthFailureCode): CredentialsSignin {
  const error = new CredentialsSignin();
  error.code = code;
  return error;
}

async function getUser(identifier: string, password: string): Promise<GetUserResult> {
  try {
    // For server-side fetch in Next.js, we need to use absolute URL
    const baseUrl = process.env.NEXTAUTH_URL ||
      (process.env.NODE_ENV === 'production'
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');

    const url = `${baseUrl}/api/auth/login`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Authentication API error:", errorData);

      if (response.status === 401) {
        return { ok: false, code: "invalid_credentials" };
      }

      if (response.status === 403) {
        return { ok: false, code: "account_disabled" };
      }

      return { ok: false, code: "auth_service_error" };
    }

    const userData = await response.json();
    return { ok: true, user: userData };
  } catch (error) {
    console.error("Authentication error:", error);
    return { ok: false, code: "auth_service_error" };
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Worker ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { identifier, password } = credentials as {
          identifier?: string;
          password?: string;
        };

        if (!identifier?.trim() || !password?.trim()) {
          throw credentialsError("invalid_credentials");
        }

        const authResult = await getUser(identifier.trim(), password);

        if (!authResult.ok) {
          throw credentialsError(authResult.code);
        }

        if (!authResult.user.isActive) {
          throw credentialsError("account_disabled");
        }

        return authResult.user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.workerId = user.workerId;
        token.facilityId = user.facilityId;
        token.facilityName = user.facilityName;
        token.district = user.district;
        token.province = user.province;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user!.role = token.role as UserRole;
        session.user!.id = token.id as string;
        session.user!.workerId = token.workerId as string;
        session.user!.facilityId = token.facilityId as string;
        session.user!.facilityName = token.facilityName as string;
        session.user!.district = token.district as RwandaDistrictType;
        session.user!.province = token.province as RwandaProvinceType;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});
