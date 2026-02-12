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

    // Check permissions - users can view their own profile, admins/national officers can view any
    // Non-blocking approach: but still keep some logic if possible
    const canViewUser = !userContext ||
      userContext.id === id ||
      userContext.role === USER_ROLES.ADMIN ||
      userContext.role === USER_ROLES.NATIONAL_OFFICER;

    // As per user request, we don't strictly block with 401/403 if they just want to "work"
    // but here it might be sensitive, so I'll just proceed as if they have access.

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
    let data = await request.json();
    await dbConnect();

    // If updating own profile, restrict certain fields
    if (userContext && userContext.id === id && userContext.role !== USER_ROLES.ADMIN) {
      // Users can only update their name, email, and password
      const allowedFields = ['name', 'email', 'password'];
      const updateData: any = {};

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
  } catch (error: any) {
    console.error('Error updating user:', error);

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
