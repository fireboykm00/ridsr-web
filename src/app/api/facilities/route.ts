import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRoles, ROLE_PERMISSIONS, isAuthError } from '@/lib/api/middleware';
import { facilityService } from '@/lib/services/server/facilityService';
import type { CreateFacilityData } from '@/lib/services/server/facilityService';
import { successResponse, errorResponse } from '@/lib/api/response';
import {
  serverErrorResponse,
  validationErrorResponse,
  parseAndValidateBody,
  isApiValidationError,
  apiValidationErrorResponse,
} from '@/lib/api/error-utils';
import { createFacilitySchema, paginationSchema } from '@/lib/schemas';
import { FacilityType, RwandaDistrictType, RwandaProvinceType, UserRole } from '@/types';

const getFacilitiesQuerySchema = z.object({
  district: z.string().optional(),
  type: z.enum(['health_center', 'hospital', 'clinic', 'dispensary', 'medical_center']).optional(),
  search: z.string().optional(),
}).merge(paginationSchema.partial());

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const { district, type, search, page, limit } = getFacilitiesQuerySchema.parse(queryParams);

    const filters = {
      district: (district || user?.district) as RwandaDistrictType | undefined,
      type: type as FacilityType | undefined,
      search
    };
    const facilities = await facilityService.getFacilitiesWithFilters(filters, page, limit);

    return successResponse(facilities);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error, 'Invalid query parameters');
    }
    console.error('[API] Error fetching facilities:', error);
    return serverErrorResponse(error, 'Failed to fetch facilities', 'FACILITY_FETCH_FAILED');
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRoles(request, ROLE_PERMISSIONS.ADMIN as unknown as UserRole[]);

    const validatedData = await parseAndValidateBody(request, createFacilitySchema, {
      message: 'Please correct the highlighted facility fields.',
    });

    const getProvinceFromDistrict = (district: string): string => {
      const d = district.toLowerCase();
      const districtToProvince: Record<string, string> = {
        'gasabo': 'kigali_city', 'kicukiro': 'kigali_city', 'nyarugenge': 'kigali_city',
        'burera': 'northern_province', 'gakenke': 'northern_province', 'gicumbi': 'northern_province', 'musanze': 'northern_province', 'rulindo': 'northern_province',
        'huye': 'southern_province', 'kamonyi': 'southern_province', 'muhanga': 'southern_province', 'nyamagabe': 'southern_province', 'nyanza': 'southern_province', 'nyaruguru': 'southern_province', 'ruhango': 'southern_province',
        'bugesera': 'eastern_province', 'gatsibo': 'eastern_province', 'kayonza': 'eastern_province', 'kirehe': 'eastern_province', 'ngoma': 'eastern_province', 'nyagatare': 'eastern_province', 'rwamagana': 'eastern_province',
        'karongi': 'western_province', 'ngororero': 'western_province', 'nyabihu': 'western_province', 'nyamasheke': 'western_province', 'rubavu': 'western_province', 'rusizi': 'western_province', 'rutsiro': 'western_province',
      };
      return districtToProvince[d] || 'kigali_city';
    };

    const facilityData: CreateFacilityData = {
      name: validatedData.name,
      code: validatedData.code,
      type: validatedData.type as FacilityType,
      district: validatedData.district as RwandaDistrictType,
      province: (validatedData.province || getProvinceFromDistrict(validatedData.district)) as RwandaProvinceType,
      contactPerson: validatedData.contactPerson,
      phone: validatedData.phone,
      email: validatedData.email
    };

    const facility = await facilityService.createFacility(facilityData);
    return successResponse(facility, 201);
  } catch (error) {
    if (isAuthError(error)) {
      return errorResponse(error.message, error.status);
    }
    if (isApiValidationError(error)) {
      return apiValidationErrorResponse(error);
    }
    console.error('[API] Error creating facility:', error);
    return serverErrorResponse(error, 'Failed to create facility', 'FACILITY_CREATE_FAILED');
  }
}
