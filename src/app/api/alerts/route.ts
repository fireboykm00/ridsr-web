import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth, isAuthError } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { serverErrorResponse, validationErrorResponse } from '@/lib/api/error-utils';
import { alertService } from '@/lib/services/server/alertService';

const alertsQuerySchema = z.object({
  status: z.enum(['active', 'resolved', 'all']).default('active'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  district: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.string().default('50'),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const { status, severity, district, dateFrom, dateTo, limit } = alertsQuerySchema.parse(
      Object.fromEntries(searchParams.entries()),
    );

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10), 1), 200);
    const queryOptions = {
      district: district || undefined,
      severity: severity || undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit: parsedLimit,
    };

    const activeAlerts = status !== 'resolved'
      ? await alertService.getActiveAlerts(user, queryOptions)
      : [];
    const resolvedAlerts = status !== 'active'
      ? await alertService.getResolvedAlerts(user, queryOptions)
      : [];
    const alerts = status === 'all' ? [...activeAlerts, ...resolvedAlerts] : (status === 'active' ? activeAlerts : resolvedAlerts);

    return successResponse(alerts);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error, 'Invalid alert query parameters');
    }
    console.error('[API] Error fetching alerts:', error);
    return serverErrorResponse(error, 'Failed to fetch alerts', 'ALERT_FETCH_FAILED');
  }
}
