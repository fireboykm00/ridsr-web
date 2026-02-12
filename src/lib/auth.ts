// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { User, UserRole, RwandaDistrictType, RwandaProvinceType } from "@/types";

async function getUser(identifier: string, password: string): Promise<User | null> {
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
      // Log the error for debugging but return null to prevent credential errors
      const errorData = await response.json().catch(() => ({}));
      console.error("Authentication API error:", errorData);
      return null;
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Authentication error:", error);
    // Return null to prevent credential errors from leaking information
    return null;
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
        try {
          const { identifier, password } = credentials as {
            identifier?: string;
            password?: string;
          };

          if (!identifier?.trim()) {
            throw new Error("Email or Worker ID is required");
          }

          if (!password?.trim()) {
            throw new Error("Password is required");
          }

          const user = await getUser(identifier.trim(), password);

          if (!user) {
            throw new Error("Invalid email/worker ID or password");
          }

          if (!user.isActive) {
            throw new Error("Your account has been deactivated. Please contact support.");
          }

          return user;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Authentication failed";
          throw new Error(message);
        }
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
