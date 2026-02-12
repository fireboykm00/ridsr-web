import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { USER_ROLES, UserRole } from '@/types';

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

export async function withAuth(request: NextRequest) {
  void request;
  const session = await auth();
  return { user: session?.user || null };
}

export async function withRoles(request: NextRequest, allowedRoles: UserRole[]) {
  void request;
  const session = await auth();
  const user = session?.user || null;

  const hasAccess = user && allowedRoles.includes(user.role as UserRole);
  return { user, hasAccess };
}

export async function requireAuth(request: NextRequest) {
  const { user } = await withAuth(request);
  if (!user) {
    throw new AuthError('Unauthorized', 401);
  }
  return user;
}

export async function requireRoles(request: NextRequest, allowedRoles: UserRole[]) {
  const user = await requireAuth(request);
  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new AuthError('Forbidden', 403);
  }
  return user;
}

export const ROLE_PERMISSIONS = {
  ADMIN: [USER_ROLES.ADMIN],
  MANAGEMENT: [USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER],
  ALL_STAFF: [USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER, USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN],
} as const;
