import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { caseService } from '@/lib/services/server/caseService';
import { USER_ROLES, UserRole } from '@/types';

const labResultSchema = z.object({
  testType: z.string().min(1),
  testName: z.string().min(1),
  testDate: z.string().datetime(),
  resultValue: z.string().min(1),
  interpretation: z.enum(['positive', 'negative', 'equivocal', 'contaminated']),
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
    return errorResponse('Failed to fetch case lab results', 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const allowedRoles = [...ROLE_PERMISSIONS.MANAGEMENT, USER_ROLES.LAB_TECHNICIAN] as unknown as UserRole[];
    const user = await requireRoles(request, allowedRoles);
    const { id } = await params;
    const body = await request.json();
    const payload = labResultSchema.parse(body);

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
    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, error.issues[0]?.message);
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
    return errorResponse(
      'Failed to create case lab result',
      500,
      error instanceof Error ? error.message : 'Unknown server error'
    );
  }
}
