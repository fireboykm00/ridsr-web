import { USER_ROLES, type UserRole, type RwandaDistrictType } from '@/types';

export interface UserContext {
  id: string;
  role: UserRole;
  facilityId?: string;
  district?: RwandaDistrictType;
}

/**
 * Check if user can access case data
 */
export function canAccessCase(user: UserContext, caseData?: { facilityId?: string; district?: RwandaDistrictType }): boolean {
  switch (user.role) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.NATIONAL_OFFICER:
      return true;
    
    case USER_ROLES.DISTRICT_OFFICER:
      return !caseData?.district || user.district === caseData.district;
    
    case USER_ROLES.HEALTH_WORKER:
    case USER_ROLES.LAB_TECHNICIAN:
      return !caseData?.facilityId || user.facilityId === caseData.facilityId;
    
    default:
      return false;
  }
}

/**
 * Check if user can access facility data
 */
export function canAccessFacility(user: UserContext, facilityData?: { id?: string; district?: RwandaDistrictType }): boolean {
  switch (user.role) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.NATIONAL_OFFICER:
      return true;
    
    case USER_ROLES.DISTRICT_OFFICER:
      return !facilityData?.district || user.district === facilityData.district;
    
    case USER_ROLES.HEALTH_WORKER:
    case USER_ROLES.LAB_TECHNICIAN:
      return !facilityData?.id || user.facilityId === facilityData.id;
    
    default:
      return false;
  }
}

/**
 * Check if user can validate cases
 */
export function canValidateCase(user: UserContext): boolean {
  return [
    USER_ROLES.ADMIN,
    USER_ROLES.NATIONAL_OFFICER,
    USER_ROLES.DISTRICT_OFFICER
  ].includes(user.role);
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(user: UserContext): boolean {
  return [
    USER_ROLES.ADMIN,
    USER_ROLES.NATIONAL_OFFICER
  ].includes(user.role);
}

/**
 * Filter data based on user role and permissions
 */
export function filterByRole<T extends { facilityId?: string; district?: RwandaDistrictType }>(
  user: UserContext,
  data: T[]
): T[] {
  switch (user.role) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.NATIONAL_OFFICER:
      return data;
    
    case USER_ROLES.DISTRICT_OFFICER:
      return data.filter(item => !item.district || user.district === item.district);
    
    case USER_ROLES.HEALTH_WORKER:
    case USER_ROLES.LAB_TECHNICIAN:
      return data.filter(item => !item.facilityId || user.facilityId === item.facilityId);
    
    default:
      return [];
  }
}