import { NextRequest } from 'next/server';
import { requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { caseService } from '@/lib/services/server/caseService';
import { successResponse, errorResponse } from '@/lib/api/response';
import { serverErrorResponse } from '@/lib/api/error-utils';
import { USER_ROLES, UserRole } from '@/types';
import { FilterQuery } from 'mongoose';
import type { ICase } from '@/lib/models/Case';
import { Facility } from '@/lib/models/Facility';

export async function GET(request: NextRequest) {
  try {
    const allowedRoles = [...ROLE_PERMISSIONS.MANAGEMENT, USER_ROLES.LAB_TECHNICIAN] as unknown as UserRole[];
    const user = await requireRoles(request, allowedRoles);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filters based on user role and permissions
    const filters: FilterQuery<ICase> = { validationStatus: 'pending' };

    if (user && user.role === USER_ROLES.DISTRICT_OFFICER && user.district) {
      // District officers only see cases from facilities in their district.
      const facilities = await Facility.find({ district: user.district }).select('_id').lean();
      filters.facilityId = { $in: facilities.map((f) => f._id) };
    }
    if (user && user.role === USER_ROLES.LAB_TECHNICIAN && user.facilityId) {
      // Lab technicians only see pending cases from their own facility.
      filters.facilityId = user.facilityId;
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
        id: caseItem._id?.toString?.() || (caseItem as unknown as { id?: string }).id || '',
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
    return serverErrorResponse(error, 'Failed to fetch validation queue', 'VALIDATION_QUEUE_FAILED');
  }
}
