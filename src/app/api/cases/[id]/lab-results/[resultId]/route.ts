import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import {
  serverErrorResponse,
  parseAndValidateBody,
  isApiValidationError,
  apiValidationErrorResponse,
} from '@/lib/api/error-utils';
import { caseService } from '@/lib/services/server/caseService';
import { USER_ROLES, UserRole } from '@/types';

const patchSchema = z.object({
  testType: z.string().trim().min(1, 'Test type is required.').optional(),
  testName: z.string().trim().min(1, 'Test name is required.').optional(),
  testDate: z.string().datetime('Test date must be a valid date-time value.').optional(),
  resultValue: z.string().trim().min(1, 'Result value is required.').optional(),
  interpretation: z.enum(['positive', 'negative', 'equivocal', 'contaminated'], {
    message: 'Interpretation is required.',
  }).optional(),
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
    const payload = await parseAndValidateBody(request, patchSchema, {
      message: 'Please correct the highlighted lab result fields.',
    });

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
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
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
    return serverErrorResponse(error, 'Failed to update case lab result', 'CASE_LAB_RESULT_UPDATE_FAILED');
  }
}
