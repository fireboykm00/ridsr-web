// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { USER_ROLES, User, UserRole } from "@/types";
import { getMockUser } from "./auth-mock";

// TODO: Replace with real database authentication
async function getUser(identifier: string, password: string): Promise<User | null> {
  // For development: use mock credentials
  if (process.env.NODE_ENV === "development") {
    return getMockUser(identifier, password);
  }

  // TODO: In production, query database:
  // const user = await db.user.findUnique({
  //   where: { email: identifier }
  // });
  // if (user && await verifyPassword(password, user.passwordHash)) {
  //   return user;
  // }

  return null;
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
        session.user!.district = token.district as string;
        session.user!.province = token.province as string;
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