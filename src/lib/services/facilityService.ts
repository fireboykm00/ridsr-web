import { auth } from '@/lib/auth';
import { USER_ROLES, Facility, CreateFacilityInput, RwandaDistrictType, UpdateFacilityInput } from '@/types';

class FacilityService {
  async getAllFacilities(): Promise<Facility[]> {
    const res = await fetch('/api/facilities');
    if (!res.ok) throw new Error('Failed to fetch facilities');
    return res.json();
  }

  async getFacilitiesByDistrict(district: RwandaDistrictType): Promise<Facility[]> {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    if (![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER].includes(session.user?.role as string)) {
      throw new Error('Insufficient permissions');
    }

    if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.district !== district) {
      throw new Error('Insufficient permissions to access this district');
    }

    const res = await fetch(`/api/facilities?district=${district}`);
    if (!res.ok) throw new Error('Failed to fetch facilities');
    return res.json();
  }

  async getFacilityById(id: string): Promise<Facility | null> {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    const res = await fetch(`/api/facilities/${id}`);
    if (!res.ok) return null;
    return res.json();
  }

  async createFacility(facilityData: CreateFacilityInput): Promise<Facility> {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== USER_ROLES.ADMIN) {
      throw new Error('Only administrators can create facilities');
    }

    const res = await fetch('/api/facilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facilityData),
    });

    if (!res.ok) throw new Error('Failed to create facility');
    return res.json();
  }

  async updateFacility(id: string, facilityData: UpdateFacilityInput): Promise<Facility | null> {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== USER_ROLES.ADMIN) {
      throw new Error('Only administrators can update facilities');
    }

    const res = await fetch(`/api/facilities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facilityData),
    });

    if (!res.ok) return null;
    return res.json();
  }

  async deleteFacility(id: string): Promise<boolean> {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== USER_ROLES.ADMIN) {
      throw new Error('Only administrators can delete facilities');
    }

    const res = await fetch(`/api/facilities/${id}`, { method: 'DELETE' });
    return res.ok;
  }

  async getFacilitiesForUser(): Promise<Facility[]> {
    const session = await auth();
    if (!session?.user?.role) throw new Error('Unauthorized');

    const allFacilities = await this.getAllFacilities();

    if (session.user.role === USER_ROLES.DISTRICT_OFFICER && session.user.district) {
      return allFacilities.filter(f => f.district === session.user.district) as Facility[];
    } else if ([USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN].includes(session.user.role as string) && session.user.facilityId) {
      return allFacilities.filter(f => f.id === session.user.facilityId) as Facility[];
    }

    return allFacilities as Facility[];
  }
}

export const facilityService = new FacilityService();

export async function filterFacilitiesByAccess(facilities: Facility[]): Promise<Facility[]> {
  const session = await auth();
  if (!session?.user) return [];

  const { role, facilityId, district } = session.user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return facilities;
  if (role === USER_ROLES.DISTRICT_OFFICER && district) return facilities.filter(f => f.district === district);
  if ((role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) && facilityId) {
    return facilities.filter(f => f.id === facilityId);
  }

  return [];
}

export async function canAccessFacility(targetFacilityId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const { role, facilityId, district } = session.user;

  if (role === USER_ROLES.ADMIN || role === USER_ROLES.NATIONAL_OFFICER) return true;
  if (role === USER_ROLES.DISTRICT_OFFICER && district) return true;
  if ((role === USER_ROLES.HEALTH_WORKER || role === USER_ROLES.LAB_TECHNICIAN) && facilityId) {
    return targetFacilityId === facilityId;
  }

  return false;
}
