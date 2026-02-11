import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/services/db';
import { Case as CaseModel } from '@/lib/models';
import { USER_ROLES } from '@/types';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const status = searchParams.get('status');

    const query: any = {};
    if (facilityId) query.facilityId = facilityId;
    if (status) query.validationStatus = status;

    const cases = await CaseModel.find(query).lean();
    return NextResponse.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const data = await request.json();
    const caseRecord = await CaseModel.create({
      ...data,
      facilityId: session.user.facilityId,
      reporterId: session.user.id,
    });
    return NextResponse.json(caseRecord.toObject(), { status: 201 });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
