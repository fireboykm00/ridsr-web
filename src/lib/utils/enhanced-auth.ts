// src/lib/utils/enhanced-auth.ts
import { auth } from '@/lib/auth';
import { ROLES, UserRole } from './auth';

export interface Facility {
  id: string;
  name: string;
  district: string;
  province: string;
  type: string; // hospital, clinic, health_center, etc.
}

export interface EnhancedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  facility?: string;
  facilityId?: string;
  district?: string;
  province?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define enhanced permissions for different roles
export const PERMISSIONS = {
  // Admin permissions
  ADMIN: [
    'user.read.all',
    'user.create',
    'user.update.all',
    'user.delete',
    'case.read.all',
    'case.update.all',
    'case.delete',
    'facility.manage',
    'report.generate.global',
    'system.settings',
  ],
  
  // National Officer permissions
  NATIONAL_OFFICER: [
    'user.read.all',
    'case.read.all',
    'case.update.all',
    'report.generate.national',
    'dashboard.view.national',
  ],
  
  // District Officer permissions
  DISTRICT_OFFICER: [
    'user.read.district',
    'case.read.district',
    'case.update.district',
    'case.create',
    'report.generate.district',
    'dashboard.view.district',
    'facility.view.district',
  ],
  
  // Health Worker permissions
  HEALTH_WORKER: [
    'user.read.self',
    'case.read.self',
    'case.create',
    'case.update.self',
    'dashboard.view.facility',
    'facility.view.own',
  ],
  
  // Lab Technician permissions
  LAB_TECHNICIAN: [
    'user.read.self',
    'case.read.lab',
    'case.update.lab',
    'case.validate',
    'dashboard.view.lab',
    'facility.view.own',
  ],
} as const;

// Enhanced role-based access control helper
export async function requireRole(requiredRole: UserRole): Promise<boolean> {
  const session = await auth();

  if (!session || session.user?.role !== requiredRole) {
    return false;
  }

  return true;
}

// Check if user has any of the specified roles
export async function hasAnyRole(allowedRoles: UserRole[]): Promise<boolean> {
  const session = await auth();

  if (!session || !session.user?.role) {
    return false;
  }

  return allowedRoles.includes(session.user.role as UserRole);
}

// Check if user has a specific permission
export async function hasPermission(permission: string): Promise<boolean> {
  const session = await auth();

  if (!session || !session.user?.role) {
    return false;
  }

  const userPermissions = PERMISSIONS[session.user.role as keyof typeof PERMISSIONS] || [];
  return userPermissions.includes(permission);
}

// Check if user has admin role
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === ROLES.ADMIN;
}

// Check if user has national officer role
export async function isNationalOfficer(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === ROLES.NATIONAL_OFFICER;
}

// Check if user has district officer role
export async function isDistrictOfficer(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === ROLES.DISTRICT_OFFICER;
}

// Check if user has health worker role
export async function isHealthWorker(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === ROLES.HEALTH_WORKER;
}

// Check if user has lab technician role
export async function isLabTechnician(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === ROLES.LAB_TECHNICIAN;
}

// Check if user can access a specific facility
export async function canAccessFacility(facilityId: string): Promise<boolean> {
  const session = await auth();

  if (!session || !session.user?.role) {
    return false;
  }

  // Admins can access all facilities
  if (session.user.role === ROLES.ADMIN) {
    return true;
  }

  // National officers can access all facilities
  if (session.user.role === ROLES.NATIONAL_OFFICER) {
    return true;
  }

  // District officers can access facilities in their district
  if (session.user.role === ROLES.DISTRICT_OFFICER) {
    // In a real app, we'd check if the facility belongs to the user's district
    // For now, we'll return true if the user has a district assigned
    return !!session.user.district;
  }

  // Health workers and lab technicians can access their own facility
  if (session.user.role === ROLES.HEALTH_WORKER || session.user.role === ROLES.LAB_TECHNICIAN) {
    return session.user.facilityId === facilityId;
  }

  return false;
}

// Check if user can access resources belonging to a specific district
export async function canAccessDistrict(district: string): Promise<boolean> {
  const session = await auth();

  if (!session || !session.user?.role) {
    return false;
  }

  // Admins and national officers can access all districts
  if (session.user.role === ROLES.ADMIN || session.user.role === ROLES.NATIONAL_OFFICER) {
    return true;
  }

  // District officers can access their own district
  if (session.user.role === ROLES.DISTRICT_OFFICER) {
    return session.user.district === district;
  }

  // Health workers and lab technicians can access their own district
  if (session.user.role === ROLES.HEALTH_WORKER || session.user.role === ROLES.LAB_TECHNICIAN) {
    return session.user.district === district;
  }

  return false;
}

// Get user's accessible facilities based on role
export async function getAccessibleFacilities(): Promise<Facility[]> {
  const session = await auth();

  if (!session || !session.user?.role) {
    return [];
  }

  // In a real application, this would query the database based on the user's role and location
  // For now, we'll return mock data
  const mockFacilities: Facility[] = [
    {
      id: 'fac-1',
      name: 'Kigali Central Hospital',
      district: 'Gasabo',
      province: 'Kigali City',
      type: 'hospital'
    },
    {
      id: 'fac-2',
      name: 'Ruhengeri District Hospital',
      district: 'Ruhengeri',
      province: 'Northern Province',
      type: 'hospital'
    },
    {
      id: 'fac-3',
      name: 'Nyamata Health Center',
      district: 'Bugesera',
      province: 'Eastern Province',
      type: 'health_center'
    }
  ];

  // Admins and national officers can access all facilities
  if (session.user.role === ROLES.ADMIN || session.user.role === ROLES.NATIONAL_OFFICER) {
    return mockFacilities;
  }

  // District officers can access facilities in their district
  if (session.user.role === ROLES.DISTRICT_OFFICER && session.user.district) {
    return mockFacilities.filter(facility => facility.district === session.user.district);
  }

  // Health workers and lab technicians can access their own facility
  if ((session.user.role === ROLES.HEALTH_WORKER || session.user.role === ROLES.LAB_TECHNICIAN) && session.user.facilityId) {
    return mockFacilities.filter(facility => facility.id === session.user.facilityId);
  }

  return [];
}

// Enhanced function to get user's enhanced profile
export async function getEnhancedUserProfile(): Promise<EnhancedUser | null> {
  const session = await auth();

  if (!session || !session.user?.role) {
    return null;
  }

  const userPermissions = PERMISSIONS[session.user.role as keyof typeof PERMISSIONS] || [];

  return {
    id: session.user.id,
    name: session.user.name || '',
    email: session.user.email || '',
    role: session.user.role as UserRole,
    facility: session.user.facility,
    facilityId: session.user.facilityId,
    district: session.user.district,
    province: session.user.province,
    permissions: userPermissions,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}