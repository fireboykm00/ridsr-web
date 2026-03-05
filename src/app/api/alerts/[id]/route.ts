import { NextRequest } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { serverErrorResponse } from '@/lib/api/error-utils';
import { alertService } from '@/lib/services/server/alertService';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    if (body?.action !== 'resolve') {
      return errorResponse('Invalid action', 400, 'Only resolve action is supported', { code: 'ALERT_INVALID_ACTION' });
    }

    if (
      !body?.signature ||
      !body?.district ||
      !body?.severity ||
      !body?.title ||
      !body?.description ||
      !body?.triggerDate
    ) {
      return errorResponse('Invalid payload', 400, 'Missing alert payload required to resolve this alert', {
        code: 'ALERT_RESOLVE_PAYLOAD_INVALID',
      });
    }

    const resolved = await alertService.resolveAlert(user, {
      alertId: id,
      signature: body.signature,
      district: body.district,
      severity: body.severity,
      title: body.title,
      description: body.description,
      triggerDate: body.triggerDate,
    });

    return successResponse({
      id: resolved?.alertId || id,
      status: 'resolved',
      resolvedAt: resolved?.resolvedAt || new Date().toISOString(),
    });
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('[API] Error updating alert:', error);
    return serverErrorResponse(error, 'Failed to update alert', 'ALERT_UPDATE_FAILED');
  }
}
