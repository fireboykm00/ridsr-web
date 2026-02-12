import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/lib/services/server/userService';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, email, phone } = body;

    const updatedUser = await userService.updateUserById(session.user.id, {
      name,
      email,
      phone,
    });

    if (!updatedUser) {
      return errorResponse('Failed to update profile', 500);
    }

    return successResponse({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('[API] Error updating profile:', error);
    return errorResponse('Failed to update profile');
  }
}
