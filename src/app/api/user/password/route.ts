import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { userService } from '@/lib/services/server/userService';
import { successResponse, errorResponse } from '@/lib/api/response';
import {
  serverErrorResponse,
  parseAndValidateBody,
  isApiValidationError,
  apiValidationErrorResponse,
} from '@/lib/api/error-utils';
import { verifyPassword } from '@/lib/utils/auth';
import { z } from 'zod';

const passwordUpdateSchema = z.object({
  currentPassword: z.string().trim().min(1, 'Current password is required.'),
  newPassword: z.string().trim().min(6, 'New password must be at least 6 characters.'),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { currentPassword, newPassword } = await parseAndValidateBody(request, passwordUpdateSchema, {
      message: 'Please correct the highlighted password fields.',
    });

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
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    console.error('[API] Error updating password:', error);
    return serverErrorResponse(error, 'Failed to update password', 'USER_PASSWORD_UPDATE_FAILED');
  }
}
