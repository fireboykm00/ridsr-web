import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/services/db';
import { User as UserModel } from '@/lib/models';
import { requireAuth, isAuthError } from '@/lib/api/middleware';
import { errorResponse, successResponse } from '@/lib/api/response';
import { serverErrorResponse } from '@/lib/api/error-utils';
import { USER_ROLES } from '@/types';

// GET: Search users
export async function GET(request: NextRequest) {
  try {
    const requester = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10) || 10, 1), 50);

    if (!query) {
      return errorResponse('Invalid query', 400, 'Query parameter is required', { code: 'QUERY_REQUIRED' });
    }

    await dbConnect();

    // Search users by name, email, or workerId
    const filter: Record<string, unknown> = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { workerId: { $regex: query, $options: 'i' } },
      ],
    };

    if (requester.role === USER_ROLES.DISTRICT_OFFICER && requester.district) {
      filter.district = requester.district;
    }
    if (
      (requester.role === USER_ROLES.HEALTH_WORKER || requester.role === USER_ROLES.LAB_TECHNICIAN)
      && requester.facilityId
    ) {
      filter.facilityId = requester.facilityId;
    }

    const users = await UserModel.find(filter).limit(limit).lean();

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
