import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/services/db';
import { Alert as AlertModel } from '@/lib/models';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await dbConnect();
    const alert = await AlertModel.findById(id).lean();
    if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
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
    const alert = await AlertModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await dbConnect();
    const alert = await AlertModel.findByIdAndDelete(id);
    if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    return NextResponse.json({ message: 'Alert deleted' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
