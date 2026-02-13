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

const labResultSchema = z.object({
  testType: z.string().trim().min(1, 'Test type is required.'),
  testName: z.string().trim().min(1, 'Test name is required.'),
  testDate: z.string().datetime('Test date must be a valid date-time value.'),
  resultValue: z.string().trim().min(1, 'Result value is required.'),
  interpretation: z.enum(['positive', 'negative', 'equivocal', 'contaminated'], {
    message: 'Interpretation is required.',
  }),
  resultUnit: z.string().optional(),
  referenceRange: z.string().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const allowedRoles = [...ROLE_PERMISSIONS.MANAGEMENT, USER_ROLES.LAB_TECHNICIAN] as unknown as UserRole[];
    const user = await requireRoles(request, allowedRoles);
    const { id } = await params;

    const results = await caseService.getCaseLabResults(id, {
      id: user.id,
      role: user.role as UserRole,
      facilityId: user.facilityId,
    });

    return successResponse(results);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        return errorResponse('Case not found', 404);
      }
      if (error.message === 'FORBIDDEN') {
        return errorResponse('Forbidden', 403);
      }
    }
    console.error('[API] Error fetching case lab results:', error);
    return serverErrorResponse(error, 'Failed to fetch case lab results', 'CASE_LAB_RESULTS_FETCH_FAILED');
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const allowedRoles = [...ROLE_PERMISSIONS.MANAGEMENT, USER_ROLES.LAB_TECHNICIAN] as unknown as UserRole[];
    const user = await requireRoles(request, allowedRoles);
    const { id } = await params;
    const payload = await parseAndValidateBody(request, labResultSchema, {
      message: 'Please correct the highlighted lab result fields.',
    });

    const result = await caseService.addCaseLabResult(id, payload, {
      id: user.id,
      role: user.role as UserRole,
      facilityId: user.facilityId,
    });

    return successResponse(result, 201);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        return errorResponse('Case not found', 404);
      }
      if (error.message === 'FORBIDDEN') {
        return errorResponse('Forbidden', 403);
      }
      if (error.message === 'UNAUTHORIZED') {
        return errorResponse('Unauthorized', 401);
      }
    }
    console.error('[API] Error creating case lab result:', error);
    return serverErrorResponse(error, 'Failed to create case lab result', 'CASE_LAB_RESULT_CREATE_FAILED');
  }
}
