import { NextRequest } from 'next/server';
import { requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { caseService } from '@/lib/services/server/caseService';
import { successResponse, errorResponse } from '@/lib/api/response';
import { serverErrorResponse } from '@/lib/api/error-utils';
import { USER_ROLES, UserRole } from '@/types';
import { Facility } from '@/lib/models/Facility';
import { z } from 'zod';
import type { CaseFilters } from '@/lib/services/server/caseService';

const queueQuerySchema = z.object({
  tab: z.enum(['pending', 'validated', 'rejected', 'all']).default('pending'),
  validationStatus: z.enum(['pending', 'validated', 'rejected']).optional(),
  diseaseCode: z.string().optional(),
  district: z.string().optional(),
  facilityId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.string().default('1'),
  limit: z.string().default('20'),
});

export async function GET(request: NextRequest) {
  try {
    const allowedRoles = [...ROLE_PERMISSIONS.MANAGEMENT, USER_ROLES.LAB_TECHNICIAN] as unknown as UserRole[];
    const user = await requireRoles(request, allowedRoles);

    const { searchParams } = new URL(request.url);
    const {
      tab,
      validationStatus,
      diseaseCode,
      district,
      facilityId,
      search,
      dateFrom,
      dateTo,
      page,
      limit,
    } = queueQuerySchema.parse(Object.fromEntries(searchParams.entries()));

    const normalizedPage = parseInt(page, 10);
    const normalizedLimit = Math.min(Math.max(parseInt(limit, 10), 1), 100);
    const scopedValidationStatus = validationStatus || (tab !== 'all' ? tab : undefined);

    const filters: CaseFilters = {};

    if (scopedValidationStatus) {
      filters.validationStatus = scopedValidationStatus;
    }
    if (district) filters.district = district;
    if (diseaseCode) filters.diseaseCode = diseaseCode as CaseFilters['diseaseCode'];
    if (search) filters.search = search;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    let scopedFacilityIds: string[] | undefined;
    if (facilityId) {
      scopedFacilityIds = [facilityId];
    }
    if (user && user.role === USER_ROLES.DISTRICT_OFFICER && user.district) {
      // District officers only see cases from facilities in their district.
      const facilities = await Facility.find({ district: user.district }).select('_id').lean();
      scopedFacilityIds = facilities.map((f) => f._id.toString());
    }
    if (user && user.role === USER_ROLES.LAB_TECHNICIAN && user.facilityId) {
      // Lab technicians only see pending cases from their own facility.
      scopedFacilityIds = [user.facilityId];
    }
    if (scopedFacilityIds?.length) filters.facilityIds = scopedFacilityIds;
    // National officers and admins see all pending cases

    const result = await caseService.getCasesWithFilters(filters, normalizedPage, normalizedLimit);
    const paginatedResult = Array.isArray(result)
      ? { data: result, total: result.length, page: normalizedPage, totalPages: 1 }
      : result;

    // Populate related data for validation hub
    const populatedCases = await Promise.all(
      paginatedResult.data.map(async (caseItem) => ({
        ...caseItem,
        id: caseItem._id?.toString?.() || (caseItem as unknown as { id?: string }).id || '',
        patient: await caseService.getPatientInfo(caseItem.patientId.toString()),
        facility: await caseService.getFacilityInfo(caseItem.facilityId.toString()),
        reporter: await caseService.getReporterInfo(caseItem.reporterId.toString()),
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
