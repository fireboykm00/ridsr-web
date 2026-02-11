import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { USER_ROLES } from '@/types';

// GET: List users
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const role = searchParams.get('role');
    const district = searchParams.get('district');

    // TODO: Implement real database query
    // const users = await db.user.findMany({
    //   where: {
    //     ...(facilityId && { facilityId }),
    //     ...(role && { role }),
    //     ...(district && { district }),
    //   },
    // });

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create user
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== USER_USER_ROLES.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data: CreateUserInput = await request.json();

    // TODO: Implement real database creation
    // const user = await db.user.create({ data });

    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
