import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/services/db';
import { User as UserModel } from '@/lib/models';

// GET: Search users
export async function GET(request: NextRequest) {
  const session = await auth();
  // Non-blocking

  try {
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
    const filteredUsers = users.map((u: any) => {
      const { password, ...user } = u;
      return user;
    });

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
