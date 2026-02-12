import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/services/db';
import { User as UserModel } from '@/lib/models';
import { USER_ROLES } from '@/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userContext = session?.user;

  try {
    const { id } = await params;
    await dbConnect();

    const canViewUser =
      userContext?.id === id ||
      userContext?.role === USER_ROLES.ADMIN ||
      userContext?.role === USER_ROLES.NATIONAL_OFFICER;

    if (!userContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!canViewUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await UserModel.findById(id).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userContext = session?.user;

  try {
    const { id } = await params;
    let data = (await request.json()) as Record<string, unknown>;
    await dbConnect();

    if (!userContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canEditUser =
      userContext.id === id ||
      userContext.role === USER_ROLES.ADMIN ||
      userContext.role === USER_ROLES.NATIONAL_OFFICER;

    if (!canEditUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If updating own profile, restrict certain fields
    if (userContext && userContext.id === id && userContext.role !== USER_ROLES.ADMIN) {
      // Users can only update their name, email, and password
      const allowedFields = ['name', 'email', 'password'];
      const updateData: Record<string, unknown> = {};

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updateData[field] = data[field];
        }
      }
      data = updateData;
    }

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    // Add updatedAt timestamp
    data.updatedAt = new Date().toISOString();

    const user = await UserModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).select('-password').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('Error updating user:', error);

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ValidationError') {
      const validationMessage = 'message' in error ? String(error.message) : 'Validation failed';
      return NextResponse.json({ error: validationMessage }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userContext = session?.user;

  try {
    const { id } = await params;
    await dbConnect();

    if (!userContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canDeleteUser =
      userContext.role === USER_ROLES.ADMIN ||
      userContext.role === USER_ROLES.NATIONAL_OFFICER;

    if (!canDeleteUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent self-deletion
    if (userContext && userContext.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const success = await UserModel.findByIdAndDelete(id);
    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
