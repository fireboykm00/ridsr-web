import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// GET: Search users
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    // TODO: Implement real database search
    // const users = await db.user.findMany({
    //   where: {
    //     OR: [
    //       { name: { contains: query } },
    //       { email: { contains: query } },
    //     ],
    //   },
    // });

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
