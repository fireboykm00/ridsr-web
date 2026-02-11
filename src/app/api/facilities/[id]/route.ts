import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/services/db';
import { Facility as FacilityModel } from '@/lib/models';
import { USER_ROLES } from '@/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await dbConnect();
    const facility = await FacilityModel.findById(id).lean();
    if (!facility) return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error fetching facility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await request.json();
    await dbConnect();
    const facility = await FacilityModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!facility) return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error updating facility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await dbConnect();
    const facility = await FacilityModel.findByIdAndDelete(id);
    if (!facility) return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    return NextResponse.json({ message: 'Facility deleted' });
  } catch (error) {
    console.error('Error deleting facility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
