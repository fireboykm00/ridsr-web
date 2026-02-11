import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/services/db';
import { User as UserModel } from '@/lib/models';
import { USER_ROLES } from '@/types';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const role = searchParams.get('role');
    const district = searchParams.get('district');

    const query: any = {};
    if (facilityId) query.facilityId = facilityId;
    if (role) query.role = role;
    if (district) query.district = district;

    const users = await UserModel.find(query).lean();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
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
    const user = await UserModel.create(data);
    return NextResponse.json(user.toObject(), { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
