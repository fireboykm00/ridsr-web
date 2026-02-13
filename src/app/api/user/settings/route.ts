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

const settingsUpdateSchema = z.object({
  emailNotifications: z.boolean(),
  smsAlerts: z.boolean(),
  weeklyReports: z.boolean(),
  twoFactorAuth: z.boolean(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { emailNotifications, smsAlerts, weeklyReports, twoFactorAuth } = await parseAndValidateBody(request, settingsUpdateSchema, {
      message: 'Please correct the highlighted settings fields.',
    });

    const updatedUser = await userService.updateUserById(session.user.id, {
      settings: {
        emailNotifications,
        smsAlerts,
        weeklyReports,
        twoFactorAuth,
      },
    });

    if (!updatedUser) {
      return errorResponse('Failed to update settings', 500);
    }

    return successResponse({ message: 'Settings updated successfully' });
  } catch (error) {
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    console.error('[API] Error updating settings:', error);
    return serverErrorResponse(error, 'Failed to update settings', 'USER_SETTINGS_UPDATE_FAILED');
  }
}
