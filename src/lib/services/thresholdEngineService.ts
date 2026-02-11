import { auth } from '@/lib/auth';
import { USER_ROLES, ThresholdRule, Alert } from '@/types';

export async function getAllThresholdRules(): Promise<ThresholdRule[]> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  if (session.user.role !== USER_ROLES.ADMIN && session.user.role !== USER_ROLES.NATIONAL_OFFICER) {
    throw new Error('Insufficient permissions');
  }

  const res = await fetch('/api/threshold-rules');
  if (!res.ok) throw new Error('Failed to fetch threshold rules');
  return res.json();
}

export async function createThresholdRule(rule: Omit<ThresholdRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ThresholdRule> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  if (session.user.role !== USER_ROLES.ADMIN && session.user.role !== USER_ROLES.NATIONAL_OFFICER) {
    throw new Error('Insufficient permissions');
  }

  const res = await fetch('/api/threshold-rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });

  if (!res.ok) throw new Error('Failed to create threshold rule');
  return res.json();
}

export async function updateThresholdRule(id: string, rule: Partial<Omit<ThresholdRule, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ThresholdRule> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  if (session.user.role !== USER_ROLES.ADMIN && session.user.role !== USER_ROLES.NATIONAL_OFFICER) {
    throw new Error('Insufficient permissions');
  }

  const res = await fetch(`/api/threshold-rules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });

  if (!res.ok) throw new Error('Failed to update threshold rule');
  return res.json();
}

export async function deleteThresholdRule(id: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.role || ![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER].includes(session.user.role)) {
    throw new Error('Insufficient permissions');
  }

  const res = await fetch(`/api/threshold-rules/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function evaluateThreshold(diseaseCode: string, location: string, caseCount: number, timeWindowHours: number): Promise<boolean> {
  const res = await fetch(`/api/threshold-rules?diseaseCode=${diseaseCode}&location=${location}`);
  if (!res.ok) return false;

  const rules = await res.json();
  const rule = rules[0];
  if (!rule) return false;

  return caseCount >= rule.threshold;
}

export async function generateAlert(diseaseCode: string, location: string, caseCount: number, severity: string): Promise<Alert> {
  const session = await auth();
  if (!session?.user) throw new Error('User not authenticated');

  const res = await fetch('/api/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      diseaseCode,
      location,
      caseCount,
      threshold: caseCount,
      severity,
      status: 'ACTIVE',
    }),
  });

  if (!res.ok) throw new Error('Failed to generate alert');
  return res.json();
}
