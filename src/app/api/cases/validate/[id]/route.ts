import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { caseService } from '@/lib/services/server/caseService';
import { successResponse, errorResponse } from '@/lib/api/response';
import {
  serverErrorResponse,
  parseAndValidateBody,
  isApiValidationError,
  apiValidationErrorResponse,
} from '@/lib/api/error-utils';
import { ValidationStatus, UserRole, USER_ROLES } from '@/types';

const validateCaseSchema = z.object({
  validationStatus: z.enum(['validated', 'rejected']),
  validationNotes: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const allowedRoles = [...ROLE_PERMISSIONS.MANAGEMENT, USER_ROLES.LAB_TECHNICIAN] as unknown as UserRole[];
    const user = await requireRoles(request, allowedRoles);

    const { id } = await params;
    const { validationStatus, validationNotes } = await parseAndValidateBody(request, validateCaseSchema, {
      message: 'Please select a valid validation decision.',
    });

    // Check if case exists and is pending
    const existingCase = await caseService.findById(id);
    if (!existingCase) {
      return errorResponse('Case not found', 404);
    }

    if (existingCase.validationStatus !== 'pending') {
      return errorResponse('Case has already been validated', 400);
    }

    // Lab technicians can only validate cases from their own facility.
    if (
      user.role === USER_ROLES.LAB_TECHNICIAN &&
      (!user.facilityId || existingCase.facilityId?.toString?.() !== user.facilityId)
    ) {
      return errorResponse('Forbidden', 403);
    }

    // Update case with validation
    const caseRecord = await caseService.validateCase(
      id,
      user.id || 'anonymous',
      validationStatus as ValidationStatus
    );

    if (!caseRecord) {
      return errorResponse('Failed to validate case', 500);
    }

    return successResponse({
      ...caseRecord,
      validationNotes,
      message: `Case ${validationStatus} successfully`
    });
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    console.error('[API] Error validating case:', error);
    return serverErrorResponse(error, 'Failed to validate case', 'CASE_VALIDATE_FAILED');
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const allowedRoles = [...ROLE_PERMISSIONS.MANAGEMENT, USER_ROLES.LAB_TECHNICIAN] as unknown as UserRole[];
    await requireRoles(request, allowedRoles);

    const { id } = await params;
    const caseRecord = await caseService.findById(id);

    if (!caseRecord) {
      return errorResponse('Case not found', 404);
    }

    const validationInfo = {
      id: caseRecord._id,
      validationStatus: caseRecord.validationStatus,
      validatorId: caseRecord.validatorId,
      validationDate: caseRecord.validationDate,
      canValidate: caseRecord.validationStatus === 'pending'
    };

    return successResponse(validationInfo);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('[API] Error fetching case validation info:', error);
    return serverErrorResponse(error, 'Failed to fetch validation info', 'CASE_VALIDATION_INFO_FAILED');
  }
}
