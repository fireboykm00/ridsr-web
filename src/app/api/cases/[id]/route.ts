import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/services/db';
import { Case as CaseModel } from '@/lib/models';
import { USER_ROLES } from '@/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await dbConnect();
    const caseRecord = await CaseModel.findById(id).lean();
    if (!caseRecord) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    return NextResponse.json(caseRecord);
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await request.json();
    await dbConnect();
    const caseRecord = await CaseModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!caseRecord) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    return NextResponse.json(caseRecord);
  } catch (error) {
    console.error('Error updating case:', error);
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
    const caseRecord = await CaseModel.findByIdAndDelete(id);
    if (!caseRecord) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    return NextResponse.json({ message: 'Case deleted' });
  } catch (error) {
    console.error('Error deleting case:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
