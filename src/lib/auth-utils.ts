// src/lib/auth-utils.ts
// Consolidated authentication utilities - single source of truth
import { auth } from "@/lib/auth";
import { USER_ROLES, UserRole, Facility, User } from "@/types";

// Granular permissions by role
export const PERMISSIONS: Record<UserRole, string[]> = {
  [USER_ROLES.ADMIN]: [
    "user.read.all",
    "user.create",
    "user.update.all",
    "user.delete",
    "case.read.all",
    "case.update.all",
    "case.delete",
    "facility.manage",
    "report.generate.global",
    "system.settings",
  ],
  [USER_ROLES.NATIONAL_OFFICER]: [
    "user.read.all",
    "case.read.all",
    "case.update.all",
    "report.generate.national",
    "dashboard.view.national",
  ],
  [USER_ROLES.DISTRICT_OFFICER]: [
    "user.read.district",
    "case.read.district",
    "case.update.district",
    "report.generate.district",
    "dashboard.view.district",
  ],
  [USER_ROLES.HEALTH_WORKER]: [
    "case.create",
    "case.read.facility",
    "case.update.own",
    "patient.read.facility",
    "patient.create",
    "report.view.facility",
  ],
  [USER_ROLES.LAB_TECHNICIAN]: [
    "case.read.facility",
    "case.update.facility",
    "lab_result.create",
    "lab_result.update",
    "report.view.facility",
  ],
};

// Role checking functions
export async function requireRole(requiredRole: UserRole): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === requiredRole;
}

export async function hasAnyRole(allowedRoles: UserRole[]): Promise<boolean> {
  const session = await auth();
  return session?.user?.role ? allowedRoles.includes(session.user.role) : false;
}

export async function isAdmin(): Promise<boolean> {
  return requireRole(USER_ROLES.ADMIN);
}

export async function isNationalOfficer(): Promise<boolean> {
  return requireRole(USER_ROLES.NATIONAL_OFFICER);
}

export async function isDistrictOfficer(): Promise<boolean> {
  return requireRole(USER_ROLES.DISTRICT_OFFICER);
}

export async function isHealthWorker(): Promise<boolean> {
  return requireRole(USER_ROLES.HEALTH_WORKER);
}

export async function isLabTechnician(): Promise<boolean> {
  return requireRole(USER_ROLES.LAB_TECHNICIAN);
}

// Permission checking
export async function hasPermission(permission: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.role) return false;

  const userPermissions = PERMISSIONS[session.user.role] || [];
  return userPermissions.includes(permission);
}

// User profile
export async function getEnhancedUserProfile(): Promise<User | null> {
  const session = await auth();
  if (!session?.user) return null;

  return {
    id: session.user.id || '',
    workerId: session.user.workerId || '',
    name: session.user.name || '',
    email: session.user.email || '',
    role: session.user.role || USER_ROLES.HEALTH_WORKER,
    facilityId: session.user.facilityId || '',
    district: session.user.district,
    province: session.user.province,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Facility access
export async function canAccessFacility(facilityId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  if (session.user.role === USER_ROLES.ADMIN || session.user.role === USER_ROLES.NATIONAL_OFFICER) {
    return true;
  }

  return session.user.facilityId === facilityId;
}

// District access
export async function canAccessDistrict(district: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  if (session.user.role === USER_ROLES.ADMIN || session.user.role === USER_ROLES.NATIONAL_OFFICER) {
    return true;
  }

  if (session.user.role === USER_ROLES.DISTRICT_OFFICER) {
    return session.user.district === district;
  }

  return false;
}

export async function getAccessibleFacilities(): Promise<Facility[]> {
  const session = await auth();
  if (!session?.user) return [];

  // Fetch from API based on user role and location
  try {
    const response = await fetch('/api/facilities');
    if (!response.ok) return [];
    
    const facilities: Facility[] = await response.json();
    
    // Filter based on user permissions
    if (session.user.role === USER_ROLES.ADMIN || session.user.role === USER_ROLES.NATIONAL_OFFICER) {
      return facilities;
    } else if (session.user.role === USER_ROLES.DISTRICT_OFFICER && session.user.district) {
      return facilities.filter(f => f.district === session.user.district);
    } else if (session.user.facilityId) {
      return facilities.filter(f => f.id === session.user.facilityId);
    }
    
    return facilities;
  } catch (error) {
    console.error('Error fetching accessible facilities:', error);
    return [];
  }
}

// Resource permission
export async function hasResourcePermission(
  resourceOwnerId: string,
  requiredRole?: UserRole
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.role) return false;

  if (session.user.role === USER_ROLES.ADMIN) return true;
  if (requiredRole && session.user.role !== requiredRole) return false;
  return session.user.id === resourceOwnerId;
}
