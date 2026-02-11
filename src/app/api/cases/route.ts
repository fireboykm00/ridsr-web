import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { USER_ROLES } from '@/types';

// GET: List cases
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const status = searchParams.get('status');

    // TODO: Implement real database query with access control
    // const cases = await db.case.findMany({
    //   where: {
    //     ...(facilityId && { facilityId }),
    //     ...(status && { validationStatus: status }),
    //   },
    // });

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create case
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();

    // TODO: Implement real database creation
    // const caseRecord = await db.case.create({
    //   data: {
    //     ...data,
    //     facilityId: session.user.facilityId,
    //     reporterId: session.user.id,
    //   },
    // });

    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
