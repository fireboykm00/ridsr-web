import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { caseService } from '@/lib/services/server/caseService';
import { USER_ROLES, UserRole } from '@/types';

const patchSchema = z.object({
  testType: z.string().min(1).optional(),
  testName: z.string().min(1).optional(),
  testDate: z.string().datetime().optional(),
  resultValue: z.string().min(1).optional(),
  interpretation: z.enum(['positive', 'negative', 'equivocal', 'contaminated']).optional(),
  resultUnit: z.string().optional(),
  referenceRange: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resultId: string }> }
) {
  try {
    const allowedRoles = [...ROLE_PERMISSIONS.MANAGEMENT, USER_ROLES.LAB_TECHNICIAN] as unknown as UserRole[];
    const user = await requireRoles(request, allowedRoles);
    const { id, resultId } = await params;
    const body = await request.json();
    const payload = patchSchema.parse(body);

    if (Object.keys(payload).length === 0) {
      return errorResponse('Validation failed', 400, 'At least one field is required');
    }

    const result = await caseService.updateCaseLabResult(id, resultId, payload, {
      id: user.id,
      role: user.role as UserRole,
      facilityId: user.facilityId,
    });

    return successResponse(result);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.issues[0]?.message);
    }
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        return errorResponse('Case or lab result not found', 404);
      }
      if (error.message === 'FORBIDDEN') {
        return errorResponse('Forbidden', 403);
      }
    }
    console.error('[API] Error updating case lab result:', error);
    return errorResponse(
      'Failed to update case lab result',
      500,
      error instanceof Error ? error.message : 'Unknown server error'
    );
  }
}
