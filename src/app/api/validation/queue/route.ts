import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { USER_ROLES } from '@/types';

// GET: Get validation queue
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    // TODO: Implement real database query
    // const queue = await db.case.findMany({
    //   where: { validationStatus: 'pending' },
    //   orderBy: { createdAt: 'asc' },
    // });

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
