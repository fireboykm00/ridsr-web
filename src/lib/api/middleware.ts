import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { USER_ROLES, UserRole } from '@/types';

export async function withAuth(request: NextRequest) {
  const session = await auth();
  return { user: session?.user || null };
}

export async function withRoles(request: NextRequest, allowedRoles: UserRole[]) {
  const session = await auth();
  const user = session?.user || null;

  const hasAccess = user && allowedRoles.includes(user.role as UserRole);
  return { user, hasAccess };
}

export const ROLE_PERMISSIONS = {
  ADMIN: [USER_ROLES.ADMIN],
  MANAGEMENT: [USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER],
  ALL_STAFF: [USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER, USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN],
} as const;