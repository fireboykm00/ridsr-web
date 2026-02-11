// src/lib/utils/auth.ts
import { auth } from "@/lib/auth";
import React from 'react';

// Define roles
export const ROLES = {
  ADMIN: 'admin',
  DISTRICT_OFFICER: 'district_officer',
  HEALTH_WORKER: 'health_worker',
  LAB_TECHNICIAN: 'lab_technician',
  NATIONAL_OFFICER: 'national_officer'
} as const;

// Type for user roles
export type UserRole = typeof ROLES[keyof typeof ROLES];

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

  return allowedRoles.includes(session.user.role);
}

// Check if user has admin role
export async function isAdmin() {
  return requireRole(ROLES.ADMIN);
}

// Check if user has health worker role
export async function isHealthWorker() {
  return requireRole(ROLES.HEALTH_WORKER);
}

// Higher-order function to create role-based page components
// Note: This function is not used in server components due to React element limitations
// Use role checks directly in server components with redirects
export function withRoleAccess<T extends Record<string, unknown>>(
  allowedRoles: UserRole[], 
  Component: React.ComponentType<T>
) {
  return async function RoleProtectedComponent(props: T) {
    const session = await auth();

    if (!session || !session.user?.role || !allowedRoles.includes(session.user.role)) {
      // For client components, we'll handle redirection differently
      // This function is primarily for documentation
      throw new Error('Access denied');
    }

    return React.createElement(Component, props);
  };
}

// Check if user has permission to access a specific resource
export async function hasResourcePermission(resourceOwnerId: string, requiredRole?: UserRole) {
  const session = await auth();

  if (!session || !session.user?.role) {
    return false;
  }

  // If user is admin, grant access
  if (session.user.role === ROLES.ADMIN) {
    return true;
  }

  // If a specific role is required, check for it
  if (requiredRole && session.user.role !== requiredRole) {
    return false;
  }

  // Check if user owns the resource
  return session.user.id === resourceOwnerId;
}