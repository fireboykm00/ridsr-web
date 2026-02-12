import { NextRequest } from 'next/server';
import { requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { caseService } from '@/lib/services/server/caseService';
import { successResponse, errorResponse } from '@/lib/api/response';
import { USER_ROLES, UserRole } from '@/types';
import { FilterQuery } from 'mongoose';
import type { ICase } from '@/lib/models/Case';

export async function GET(request: NextRequest) {
  try {
    const user = await requireRoles(request, ROLE_PERMISSIONS.MANAGEMENT as unknown as UserRole[]);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filters based on user role and permissions
    const filters: FilterQuery<ICase> = { validationStatus: 'pending' };

    if (user && user.role === USER_ROLES.DISTRICT_OFFICER && user.district) {
      // District officers only see cases from their district
      filters.district = user.district;
    }
    // National officers and admins see all pending cases

    const result = await caseService.getCasesWithFilters(filters, page, limit);
    const paginatedResult = Array.isArray(result)
      ? { data: result, total: result.length, page, totalPages: 1 }
      : result;

    // Populate related data for validation hub
    const populatedCases = await Promise.all(
      paginatedResult.data.map(async (caseItem) => ({
        ...caseItem,
        patient: await caseService.getPatientInfo(caseItem.patientId),
        facility: await caseService.getFacilityInfo(caseItem.facilityId),
        reporter: await caseService.getReporterInfo(caseItem.reporterId),
      }))
    );

    return successResponse({
      ...paginatedResult,
      data: populatedCases
    });
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    console.error('[API] Error fetching validation queue:', error);
    return errorResponse('Failed to fetch validation queue', 500);
  }
}
