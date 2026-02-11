import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { USER_ROLES } from '@/types';

// POST: Validate case
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { status, notes } = await request.json();

    // TODO: Implement real database update
    // const caseRecord = await db.case.update({
    //   where: { id: params.id },
    //   data: {
    //     validationStatus: status,
    //     validatorId: session.user.id,
    //     validationDate: new Date(),
    //   },
    // });

    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
