import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/services/db';
import { Facility as FacilityModel } from '@/lib/models';
import { USER_ROLES } from '@/types';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');

    const query: any = {};
    if (district) query.district = district;

    const facilities = await FacilityModel.find(query).lean();
    return NextResponse.json(facilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await request.json();
    const facility = await FacilityModel.create(data);
    return NextResponse.json(facility.toObject(), { status: 201 });
  } catch (error) {
    console.error('Error creating facility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
