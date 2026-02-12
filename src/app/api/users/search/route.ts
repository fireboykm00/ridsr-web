import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/services/db';
import { User as UserModel } from '@/lib/models';
import { requireAuth, isAuthError } from '@/lib/api/middleware';

// GET: Search users
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    await dbConnect();

    // Search users by name, email, or workerId
    const users = await UserModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { workerId: { $regex: query, $options: 'i' } },
      ],
    }).lean();

    // Only return necessary fields
    const filteredUsers = users.map((u: Record<string, unknown>) => {
      const user = { ...u };
      delete user.password;
      return user;
    });

    return NextResponse.json(filteredUsers);
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
