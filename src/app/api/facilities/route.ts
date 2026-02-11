import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { USER_ROLES } from '@/types';

// GET: List facilities
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');

    // TODO: Implement real database query
    // const facilities = await db.facility.findMany({
    //   where: { ...(district && { district }) },
    // });

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create facility
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data: CreateFacilityInput = await request.json();

    // TODO: Implement real database creation
    // const facility = await db.facility.create({ data });

    return NextResponse.json({}, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
