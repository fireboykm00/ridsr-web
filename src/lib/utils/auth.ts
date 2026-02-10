// src/lib/utils/auth.ts
import { auth } from "@/lib/auth";

// Define roles
export const ROLES = {
  ADMIN: 'admin',
  DISTRICT_OFFICER: 'district_officer',
  HEALTH_WORKER: 'health_worker',
  LAB_TECHNICIAN: 'lab_technician',
  NATIONAL_OFFICER: 'national_officer'
} as const;

// Type for user roles
export type UserRole = keyof typeof ROLES;

// Role-based access control helper
export async function requireRole(requiredRole: UserRole) {
  const session = await auth();
  
  if (!session || session.user?.role !== requiredRole) {
    return false;
  }
  
  return true;
}

// Check if user has any of the specified roles
export async function hasAnyRole(allowedRoles: UserRole[]) {
  const session = await auth();
  
  if (!session || !session.user?.role) {
    return false;
  }
  
  return allowedRoles.includes(session.user.role as UserRole);
}

// Check if user has admin role
export async function isAdmin() {
  return requireRole(ROLES.ADMIN);
}

// Check if user has health worker role
export async function isHealthWorker() {
  return requireRole(ROLES.HEALTH_WORKER);
}