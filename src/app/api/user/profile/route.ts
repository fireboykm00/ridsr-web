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
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().trim().email('Enter a valid email address.'),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { name, email } = await parseAndValidateBody(request, profileUpdateSchema, {
      message: 'Please correct the highlighted profile fields.',
    });

    const updatedUser = await userService.updateUserById(session.user.id, {
      name,
      email,
    });

    if (!updatedUser) {
      return errorResponse('Failed to update profile', 500);
    }

    return successResponse({ message: 'Profile updated successfully' });
  } catch (error) {
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    console.error('[API] Error updating profile:', error);
    return serverErrorResponse(error, 'Failed to update profile', 'USER_PROFILE_UPDATE_FAILED');
  }
}
