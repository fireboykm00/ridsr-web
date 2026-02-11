// src/lib/mocks/mock-service.ts
// Service layer for mock data operations

import { 
  Case, 
  Patient, 
  User, 
  Facility, 
  Alert, 
  Report, 
  LabResult, 
  ThresholdRule,
  ValidationStatus,
  CaseStatus,
  OutcomeStatus
} from '@/types';
import { 
  MOCK_CASES, 
  MOCK_PATIENTS, 
  MOCK_USERS, 
  MOCK_FACILITIES, 
  MOCK_ALERTS, 
  MOCK_REPORTS, 
  MOCK_LAB_RESULTS,
  MOCK_THRESHOLD_RULES
} from './mock-data';

export class MockDataService {
  // Case-related methods
  static async getCases(): Promise<Case[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CASES;
  }

  static async getCaseById(id: string): Promise<Case | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_CASES.find(c => c.id === id);
  }

  static async createCase(caseData: Partial<Case>): Promise<Case> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCase: Case = {
      id: `case_${Date.now()}`,
      patientId: caseData.patientId || '',
      facilityId: caseData.facilityId || '',
      diseaseCode: caseData.diseaseCode || '',
      symptoms: caseData.symptoms || [],
      onsetDate: caseData.onsetDate || new Date().toISOString(),
      reportDate: new Date().toISOString(),
      reporterId: caseData.reporterId || '',
      validationStatus: 'pending',
      isAlertTriggered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...caseData
    };
    
    // Add to mock data array
    (MOCK_CASES as any).push(newCase);
    return newCase;
  }

  static async updateCase(id: string, caseData: Partial<Case>): Promise<Case | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = MOCK_CASES.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    const updatedCase = { ...MOCK_CASES[index], ...caseData, updatedAt: new Date().toISOString() };
    (MOCK_CASES as any)[index] = updatedCase;
    return updatedCase;
  }

  static async deleteCase(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const initialLength = MOCK_CASES.length;
    const filteredCases = MOCK_CASES.filter(c => c.id !== id);
    (MOCK_CASES as any) = filteredCases;
    return filteredCases.length < initialLength;
  }

  // Patient-related methods
  static async getPatients(): Promise<Patient[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PATIENTS;
  }

  static async getPatientById(id: string): Promise<Patient | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_PATIENTS.find(p => p.id === id);
  }

  static async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPatient: Patient = {
      id: `patient_${Date.now()}`,
      nationalId: patientData.nationalId || '',
      firstName: patientData.firstName || '',
      lastName: patientData.lastName || '',
      dateOfBirth: patientData.dateOfBirth || new Date().toISOString(),
      gender: patientData.gender || 'other',
      phone: patientData.phone || '',
      address: patientData.address || {
        street: '',
        sector: '',
        district: 'gasabo',
        province: 'kigali_city',
        country: 'Rwanda'
      },
      occupation: patientData.occupation || '',
      emergencyContact: patientData.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...patientData
    };
    
    (MOCK_PATIENTS as any).push(newPatient);
    return newPatient;
  }

  // User-related methods
  static async getUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_USERS;
  }

  static async getUserById(id: string): Promise<User | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_USERS.find(u => u.id === id);
  }

  // Facility-related methods
  static async getFacilities(): Promise<Facility[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_FACILITIES;
  }

  static async getFacilityById(id: string): Promise<Facility | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_FACILITIES.find(f => f.id === id);
  }

  // Alert-related methods
  static async getAlerts(): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_ALERTS;
  }

  static async getAlertById(id: string): Promise<Alert | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_ALERTS.find(a => a.id === id);
  }

  // Report-related methods
  static async getReports(): Promise<Report[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_REPORTS;
  }

  static async getReportById(id: string): Promise<Report | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_REPORTS.find(r => r.id === id);
  }

  // Lab Result-related methods
  static async getLabResults(): Promise<LabResult[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_LAB_RESULTS;
  }

  static async getLabResultById(id: string): Promise<LabResult | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_LAB_RESULTS.find(lr => lr.id === id);
  }

  // Threshold Rule-related methods
  static async getThresholdRules(): Promise<ThresholdRule[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_THRESHOLD_RULES;
  }

  static async getThresholdRuleById(id: string): Promise<ThresholdRule | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_THRESHOLD_RULES.find(tr => tr.id === id);
  }

  // Search methods
  static async searchCases(searchTerm: string): Promise<Case[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!searchTerm) return MOCK_CASES;
    
    return MOCK_CASES.filter(c => 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.diseaseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  static async searchPatients(searchTerm: string): Promise<Patient[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!searchTerm) return MOCK_PATIENTS;
    
    return MOCK_PATIENTS.filter(p => 
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nationalId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  static async searchUsers(searchTerm: string): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!searchTerm) return MOCK_USERS;
    
    return MOCK_USERS.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.workerId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter methods
  static async filterCasesByStatus(status: ValidationStatus): Promise<Case[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CASES.filter(c => c.validationStatus === status);
  }

  static async filterCasesByFacility(facilityId: string): Promise<Case[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CASES.filter(c => c.facilityId === facilityId);
  }

  static async filterCasesByDisease(diseaseCode: string): Promise<Case[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CASES.filter(c => c.diseaseCode === diseaseCode);
  }

  static async filterPatientsByFacility(facilityId: string): Promise<Patient[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Note: Our mock patients don't have a facilityId field, so we return all
    // In a real implementation, this would filter by facility
    return MOCK_PATIENTS;
  }

  // Dashboard-related methods
  static async getDashboardStats() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      totalCases: MOCK_CASES.length,
      pendingCases: MOCK_CASES.filter(c => c.validationStatus === 'pending').length,
      confirmedCases: MOCK_CASES.filter(c => c.validationStatus === 'validated').length,
      resolvedCases: MOCK_CASES.filter(c => c.outcome === 'recovered' || c.outcome === 'deceased').length,
      totalFacilities: MOCK_FACILITIES.length,
      totalUsers: MOCK_USERS.length,
      activeOutbreaks: MOCK_ALERTS.filter(a => a.status === 'active').length,
      weeklyTrends: [
        { week: '2024-W05', count: 12 },
        { week: '2024-W06', count: 18 },
        { week: '2024-W07', count: 15 },
        { week: '2024-W08', count: 22 },
      ],
      diseaseDistribution: [
        { disease: 'Malaria', count: 45 },
        { disease: 'Cholera', count: 30 },
        { disease: 'Measles', count: 25 },
        { disease: 'Typhoid', count: 18 },
      ],
      facilityCaseDistribution: [
        { facility: 'Kigali Teaching Hospital', cases: 35 },
        { facility: 'CHUK Health Center', cases: 28 },
        { facility: 'Gikondo Health Post', cases: 15 },
      ],
      districtCaseDistribution: [
        { district: 'Gasabo', cases: 45 },
        { district: 'Kicukiro', cases: 32 },
        { district: 'Nyarugenge', cases: 21 },
      ],
      geographicDistribution: [
        { region: 'Kigali City', cases: 78 },
        { region: 'Northern Province', cases: 12 },
        { region: 'Southern Province', cases: 8 },
      ],
      caseStatusBreakdown: [
        { status: 'Suspected', count: 25 },
        { status: 'Confirmed', count: 45 },
        { status: 'Resolved', count: 32 },
        { status: 'Invalidated', count: 6 },
      ],
    };
  }
}

// Export individual mock data getters for direct access
export {
  MOCK_CASES,
  MOCK_PATIENTS,
  MOCK_USERS,
  MOCK_FACILITIES,
  MOCK_ALERTS,
  MOCK_REPORTS,
  MOCK_LAB_RESULTS,
  MOCK_THRESHOLD_RULES
};