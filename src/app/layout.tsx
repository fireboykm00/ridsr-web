import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from '@/providers/session-provider';
import { auth } from '@/lib/auth';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rwanda National Integrated Disease Surveillance and Response Platform (RIDSR)",
  description: "Digital platform for disease surveillance and response in Rwanda",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider session={session}>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
