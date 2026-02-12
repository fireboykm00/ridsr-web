import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/lib/services/server/userService';
import { successResponse, errorResponse } from '@/lib/api/response';
import { verifyPassword } from '@/lib/utils/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Get user with password
    const user = await userService.findById(session.user.id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Verify current password using centralized auth utility
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return errorResponse('Current password is incorrect', 400);
    }

    // Update password using the service method (handles hashing)
    await userService.updatePassword(session.user.id, newPassword);

    return successResponse({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[API] Error updating password:', error);
    return errorResponse('Failed to update password');
  }
}
