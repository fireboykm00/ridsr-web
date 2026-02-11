// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ROLES, UserRole } from "./utils/auth";

// Define the user type
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// In a real application, you would fetch user data from your database
async function getUser(email: string, password: string) {
  // This is a mock implementation - in a real app, you'd query your database
  if (email === "admin@ridsr.rw" && password === "admin123") {
    return {
      id: "1",
      name: "Admin User",
      email: "admin@ridsr.rw",
      role: ROLES.ADMIN
    };
  }

  if (email.endsWith("@ridsr.rw") && password === "health123") {
    return {
      id: "2",
      name: "Health Worker",
      email: email,
      role: ROLES.HEALTH_WORKER
    };
  }

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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        // Verify user credentials
        const user = await getUser(email, password);

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // In a real app, you would hash passwords and compare them
        // For demo purposes, we're using plain text comparison
        if (email === "admin@ridsr.rw" && password === "admin123") {
          return user;
        } else if (email.endsWith("@ridsr.rw") && password === "health123") {
          return user;
        }

        throw new Error("Invalid email or password");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user!.role = token.role as UserRole;
        session.user!.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error", // Custom error page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});