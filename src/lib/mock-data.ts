// src/lib/mock-data.ts
// Centralized mock data for development/testing
// Remove this file when switching to real database

export const MOCK_THRESHOLD_RULES = {
  ADMIN: [
    { id: '1', disease: 'Malaria', threshold: 100, alert: 'High' },
    { id: '2', disease: 'Typhoid', threshold: 50, alert: 'Medium' },
  ],
  DISTRICT_OFFICER: [
    { id: '1', disease: 'Malaria', threshold: 100, alert: 'High' },
  ],
  HEALTH_WORKER: [
    { id: '1', disease: 'Malaria', threshold: 50, alert: 'Medium' },
  ],
};

export const MOCK_ALERTS = {
  ADMIN: [
    { id: '1', disease: 'Malaria', count: 120, status: 'Active' },
    { id: '2', disease: 'Typhoid', count: 45, status: 'Active' },
  ],
  DISTRICT_OFFICER: [
    { id: '1', disease: 'Malaria', count: 120, status: 'Active' },
  ],
  HEALTH_WORKER: [
    { id: '1', disease: 'Malaria', count: 15, status: 'Active' },
  ],
};

export const MOCK_PATIENTS = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    nationalId: '1234567890',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    phone: '+250788123456',
    email: 'john@example.com',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    nationalId: '0987654321',
    dateOfBirth: '1992-05-20',
    gender: 'female',
    phone: '+250788654321',
    email: 'jane@example.com',
  },
];

export const MOCK_DISTRICTS = [
  { id: 'gasabo', name: 'Gasabo', cases: 145, facilities: 15 },
  { id: 'kicukiro', name: 'Kicukiro', cases: 98, facilities: 12 },
  { id: 'nyarugenge', name: 'Nyarugenge', cases: 167, facilities: 18 },
];

export const MOCK_FACILITIES = [
  { id: 'fac001', name: 'Kigali Central Hospital', type: 'hospital', district: 'gasabo' },
  { id: 'fac002', name: 'Kicukiro Health Center', type: 'health_center', district: 'kicukiro' },
];
