// src/lib/auth-mock.ts
// Mock credentials for development/testing only
// DO NOT USE IN PRODUCTION

import { USER_ROLES, User, UserRole, RwandaDistrictType } from "@/types";

export const MOCK_CREDENTIALS = {
  ADMIN: { workerId: "ADMIN001", email: "admin@ridsr.rw", password: "admin123" },
  HEALTH_WORKER: { workerId: "HW001", email: "hw001@ridsr.rw", password: "health123" },
  DISTRICT_OFFICER: { workerId: "DT001", email: "dt001@ridsr.rw", password: "health123" },
  LAB_TECHNICIAN: { workerId: "LT001", email: "lt001@ridsr.rw", password: "health123" },
  NATIONAL_OFFICER: { workerId: "NO001", email: "no001@ridsr.rw", password: "health123" },
};

export async function getMockUser(identifier: string, password: string): Promise<User | null> {
  // Accept either workerId or email
  const isEmail = identifier.includes("@");
  const lowerIdentifier = identifier.toLowerCase();

  // Admin
  if (
    ((isEmail && lowerIdentifier === MOCK_CREDENTIALS.ADMIN.email.toLowerCase()) ||
      (!isEmail && identifier === MOCK_CREDENTIALS.ADMIN.workerId)) &&
    password === MOCK_CREDENTIALS.ADMIN.password
  ) {
    return {
      id: "1",
      workerId: MOCK_CREDENTIALS.ADMIN.workerId,
      name: "Admin User",
      email: MOCK_CREDENTIALS.ADMIN.email,
      role: USER_ROLES.ADMIN,
      facilityId: "FAC001",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Health Worker
  if (
    ((isEmail && lowerIdentifier === MOCK_CREDENTIALS.HEALTH_WORKER.email.toLowerCase()) ||
      (!isEmail && identifier === MOCK_CREDENTIALS.HEALTH_WORKER.workerId)) &&
    password === MOCK_CREDENTIALS.HEALTH_WORKER.password
  ) {
    return {
      id: "2",
      workerId: MOCK_CREDENTIALS.HEALTH_WORKER.workerId,
      name: "Health Worker",
      email: MOCK_CREDENTIALS.HEALTH_WORKER.email,
      role: USER_ROLES.HEALTH_WORKER,
      facilityId: "FAC001",
      district: "gasabo" as RwandaDistrictType,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // District Officer
  if (
    ((isEmail && lowerIdentifier === MOCK_CREDENTIALS.DISTRICT_OFFICER.email.toLowerCase()) ||
      (!isEmail && identifier === MOCK_CREDENTIALS.DISTRICT_OFFICER.workerId)) &&
    password === MOCK_CREDENTIALS.DISTRICT_OFFICER.password
  ) {
    return {
      id: "3",
      workerId: MOCK_CREDENTIALS.DISTRICT_OFFICER.workerId,
      name: "District Officer",
      email: MOCK_CREDENTIALS.DISTRICT_OFFICER.email,
      role: USER_ROLES.DISTRICT_OFFICER,
      facilityId: "FAC001",
      district: "gasabo" as RwandaDistrictType,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Lab Technician
  if (
    ((isEmail && lowerIdentifier === MOCK_CREDENTIALS.LAB_TECHNICIAN.email.toLowerCase()) ||
      (!isEmail && identifier === MOCK_CREDENTIALS.LAB_TECHNICIAN.workerId)) &&
    password === MOCK_CREDENTIALS.LAB_TECHNICIAN.password
  ) {
    return {
      id: "4",
      workerId: MOCK_CREDENTIALS.LAB_TECHNICIAN.workerId,
      name: "Lab Technician",
      email: MOCK_CREDENTIALS.LAB_TECHNICIAN.email,
      role: USER_ROLES.LAB_TECHNICIAN,
      facilityId: "FAC001",
      district: "gasabo" as RwandaDistrictType,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // National Officer
  if (
    ((isEmail && lowerIdentifier === MOCK_CREDENTIALS.NATIONAL_OFFICER.email.toLowerCase()) ||
      (!isEmail && identifier === MOCK_CREDENTIALS.NATIONAL_OFFICER.workerId)) &&
    password === MOCK_CREDENTIALS.NATIONAL_OFFICER.password
  ) {
    return {
      id: "5",
      workerId: MOCK_CREDENTIALS.NATIONAL_OFFICER.workerId,
      name: "National Officer",
      email: MOCK_CREDENTIALS.NATIONAL_OFFICER.email,
      role: USER_ROLES.NATIONAL_OFFICER,
      facilityId: "FAC001",
      province: "kigali_city",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return null;
}
