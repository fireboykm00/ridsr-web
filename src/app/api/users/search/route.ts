import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/services/db';
import { User as UserModel } from '@/lib/models';
import { requireAuth, isAuthError } from '@/lib/api/middleware';
import { errorResponse, successResponse } from '@/lib/api/response';
import { serverErrorResponse } from '@/lib/api/error-utils';

// GET: Search users
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return errorResponse('Invalid query', 400, 'Query parameter is required', { code: 'QUERY_REQUIRED' });
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

    return successResponse(filteredUsers);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('Error searching users:', error);
    return serverErrorResponse(error, 'Failed to search users', 'USER_SEARCH_FAILED');
  }
}
