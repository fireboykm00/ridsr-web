import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function withAuth(handler: (req: NextRequest, session: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return await handler(req, session);
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export async function withRole(roles: string[]) {
  return (handler: (req: NextRequest, session: any) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (!roles.includes(session.user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return await handler(req, session);
    };
  };
}
