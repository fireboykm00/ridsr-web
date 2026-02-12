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
    const { emailNotifications, smsAlerts, weeklyReports, twoFactorAuth } = body;

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
    console.error('[API] Error updating settings:', error);
    return errorResponse('Failed to update settings');
  }
}
