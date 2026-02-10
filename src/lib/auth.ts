// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// In a real application, you would fetch user data from your database
async function getUser(email: string, password: string) {
  // This is a mock implementation - in a real app, you'd query your database
  if (email === "admin@ridsr.rw" && password === "admin123") {
    return {
      id: "1",
      name: "Admin User",
      email: "admin@ridsr.rw",
      role: "admin"
    };
  }
  
  if (email.endsWith("@ridsr.rw") && password === "health123") {
    return {
      id: "2",
      name: "Health Worker",
      email: email,
      role: "health_worker"
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
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (!email || !password) {
          return null;
        }

        // Verify user credentials
        const user = await getUser(email, password);
        
        if (!user) {
          return null;
        }

        // In a real app, you would hash passwords and compare them
        // For demo purposes, we're using plain text comparison
        if (email === "admin@ridsr.rw" && password === "admin123") {
          return user;
        } else if (email.endsWith("@ridsr.rw") && password === "health123") {
          return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = user.role;
        (token as any).id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = (token as any).role as string;
        session.user.id = (token as any).id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});