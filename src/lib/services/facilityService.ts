import { USER_ROLES, Facility, CreateFacilityInput, RwandaDistrictType, UpdateFacilityInput, User, ExtendedSession } from '@/types';
import { normalizeId, normalizeIds } from '@/lib/utils/normalize';
import { throwApiError } from '@/lib/utils/apiError';

class FacilityService {
  async getAllFacilities(): Promise<Facility[]> {
    const res = await fetch('/api/facilities');
    if (!res.ok) await throwApiError(res, 'Failed to fetch facilities');
    const responseData = await res.json();
    return normalizeIds(responseData.data || responseData);
  }

  async getFacilitiesByDistrict(district: RwandaDistrictType, user?: User | ExtendedSession['user']): Promise<Facility[]> {
    if (user) {
      if (![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER].includes(user.role)) {
        throw new Error('Insufficient permissions');
      }

      if (user.role === USER_ROLES.DISTRICT_OFFICER && user.district !== district) {
        throw new Error('Insufficient permissions to access this district');
      }
    }

    const res = await fetch(`/api/facilities?district=${district}`);
    if (!res.ok) await throwApiError(res, 'Failed to fetch facilities');
    const responseData = await res.json();
    return normalizeIds(responseData.data || responseData);
  }

  async getFacilityById(id: string): Promise<Facility | null> {
    if (!id || id === 'undefined') return null;

    const res = await fetch(`/api/facilities/${id}`);
    if (!res.ok) return null;
    const responseData = await res.json();
    return normalizeId(responseData.data || responseData);
  }

  async createFacility(facilityData: CreateFacilityInput): Promise<Facility> {
    const res = await fetch('/api/facilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facilityData),
    });

    if (!res.ok) await throwApiError(res, 'Failed to create facility');
    const responseData = await res.json();
    return normalizeId(responseData.data || responseData);
  }

  async updateFacility(id: string, facilityData: UpdateFacilityInput): Promise<Facility | null> {
    const res = await fetch(`/api/facilities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facilityData),
    });

    if (!res.ok) await throwApiError(res, 'Failed to update facility');
    const responseData = await res.json();
    return normalizeId(responseData.data || responseData);
  }

  async deleteFacility(id: string): Promise<boolean> {
    const res = await fetch(`/api/facilities/${id}`, { method: 'DELETE' });
    if (!res.ok) await throwApiError(res, 'Failed to delete facility');
    return res.ok;
  }

  async getFacilitiesForUser(user?: User | ExtendedSession['user']): Promise<Facility[]> {
    const allFacilities = await this.getAllFacilities();
    if (!user) return allFacilities;

    if (user.role === USER_ROLES.DISTRICT_OFFICER && user.district) {
      return allFacilities.filter(f => f.district === user.district) as Facility[];
    } else if ([USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN].includes(user.role as string) && user.facilityId) {
      return allFacilities.filter(f => f.id === user.facilityId) as Facility[];
    }

    return allFacilities as Facility[];
  }
}

export const facilityService = new FacilityService();

export function filterFacilitiesByAccess(facilities: Facility[], user?: User | ExtendedSession['user']): Facility[] {
  if (!user) return facilities;

  const { role, facilityId, district } = user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return facilities;
  if (role === USER_ROLES.DISTRICT_OFFICER && district) return facilities.filter(f => f.district === district);
  if ((role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) && facilityId) {
    return facilities.filter(f => f.id === facilityId);
  }

  return [];
}

export function canAccessFacility(targetFacilityId: string, user?: User | ExtendedSession['user']): boolean {
  if (!user) return true;

  const { role, facilityId, district } = user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return true;
  if (role === USER_ROLES.DISTRICT_OFFICER && district) return true;
  if ((role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) && facilityId) {
    return targetFacilityId === facilityId;
  }

  return false;
}
