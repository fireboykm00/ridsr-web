// src/providers/session-provider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/components/ui/Toast';
import { Session } from 'next-auth';

type Props = {
  children: React.ReactNode;
  session: Session | null;
};

export default function NextAuthProvider({ children, session }: Props) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}