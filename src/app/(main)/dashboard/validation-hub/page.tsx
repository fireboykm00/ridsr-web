// src/app/(main)/dashboard/validation-hub/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { USER_ROLES } from '@/types';
import { facilityService } from '@/lib/services/facility-service';

interface Case {
  id: string;
  patientName: string;
  disease: string;
  status: 'suspected' | 'confirmed' | 'resolved' | 'pending_validation' | 'validated' | 'invalidated';
  date: string;
  reporter: string;
  facility: string;
  district: string;
  symptoms: string[];
  sampleId?: string;
  labResults?: string;
}

const ValidationHub = () => {
  const { data: session, status } = useSession();
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending_validation');

  useEffect(() => {
    const loadCases = async () => {
      if (status === 'authenticated' && session) {
        try {
          // In a real application, this would fetch from the database
          // For now, we'll generate mock cases based on user's role and location
          let mockCases: Case[] = [];

          if (session.user?.role === USER_ROLES.LAB_TECHNICIAN && session.user.facilityId) {
            // Lab technicians see cases that need validation from their facility or nearby
            mockCases = [
              {
                id: 'case-1',
                patientName: 'John Doe',
                disease: 'Malaria',
                status: 'pending_validation',
                date: '2024-01-25',
                reporter: 'Health Worker 1',
                facility: 'Kigali Central Hospital',
                district: 'Gasabo',
                symptoms: ['Fever', 'Headache', 'Nausea'],
                sampleId: 'LAB-2024-001'
              },
              {
                id: 'case-2',
                patientName: 'Jane Smith',
                disease: 'Typhoid',
                status: 'pending_validation',
                date: '2024-01-24',
                reporter: 'Health Worker 2',
                facility: 'Gikondo Health Center',
                district: 'Gasabo',
                symptoms: ['Fever', 'Abdominal pain', 'Weakness'],
                sampleId: 'LAB-2024-002'
              },
              {
                id: 'case-3',
                patientName: 'Bob Johnson',
                disease: 'Cholera',
                status: 'validated',
                date: '2024-01-23',
                reporter: 'Health Worker 3',
                facility: 'Kigali Central Hospital',
                district: 'Gasabo',
                symptoms: ['Diarrhea', 'Dehydration'],
                sampleId: 'LAB-2024-003',
                labResults: 'Positive for Vibrio cholerae'
              },
              {
                id: 'case-4',
                patientName: 'Alice Williams',
                disease: 'Measles',
                status: 'pending_validation',
                date: '2024-01-22',
                reporter: 'Health Worker 4',
                facility: 'Nyamata Health Center',
                district: 'Bugesera',
                symptoms: ['Rash', 'Fever', 'Cough'],
                sampleId: 'LAB-2024-004'
              }
            ];
          } else if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.district) {
            // District officers see cases in their district that need validation
            mockCases = [
              {
                id: 'case-1',
                patientName: 'John Doe',
                disease: 'Malaria',
                status: 'pending_validation',
                date: '2024-01-25',
                reporter: 'Health Worker 1',
                facility: 'Kigali Central Hospital',
                district: session.user.district,
                symptoms: ['Fever', 'Headache', 'Nausea'],
                sampleId: 'LAB-2024-001'
              },
              {
                id: 'case-2',
                patientName: 'Jane Smith',
                disease: 'Typhoid',
                status: 'validated',
                date: '2024-01-24',
                reporter: 'Health Worker 2',
                facility: 'Gikondo Health Center',
                district: session.user.district,
                symptoms: ['Fever', 'Abdominal pain', 'Weakness'],
                sampleId: 'LAB-2024-002',
                labResults: 'Positive for Salmonella Typhi'
              }
            ];
          } else if (session.user?.role === USER_ROLES.NATIONAL_OFFICER) {
            // National officers see all cases that need validation
            mockCases = [
              {
                id: 'case-1',
                patientName: 'John Doe',
                disease: 'Malaria',
                status: 'pending_validation',
                date: '2024-01-25',
                reporter: 'Health Worker 1',
                facility: 'Kigali Central Hospital',
                district: 'Gasabo',
                symptoms: ['Fever', 'Headache', 'Nausea'],
                sampleId: 'LAB-2024-001'
              },
              {
                id: 'case-2',
                patientName: 'Jane Smith',
                disease: 'Typhoid',
                status: 'validated',
                date: '2024-01-24',
                reporter: 'Health Worker 2',
                facility: 'Gikondo Health Center',
                district: 'Gasabo',
                symptoms: ['Fever', 'Abdominal pain', 'Weakness'],
                sampleId: 'LAB-2024-002',
                labResults: 'Positive for Salmonella Typhi'
              },
              {
                id: 'case-3',
                patientName: 'Bob Johnson',
                disease: 'Cholera',
                status: 'pending_validation',
                date: '2024-01-23',
                reporter: 'Health Worker 3',
                facility: 'Ruhengeri Hospital',
                district: 'Ruhengeri',
                symptoms: ['Diarrhea', 'Dehydration'],
                sampleId: 'LAB-2024-003'
              }
            ];
          }

          setCases(mockCases);
          setFilteredCases(mockCases);
        } catch (error) {
          console.error('Error loading cases:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCases();
  }, [status, session]);

  // Apply filter when filter changes
  useEffect(() => {
    if (filter === 'all') {
      setFilteredCases(cases);
    } else {
      setFilteredCases(cases.filter(caseItem => caseItem.status === filter));
    }
  }, [filter, cases]);

  const handleValidateCase = (caseId: string) => {
    // In a real application, this would send the validation to the backend
    console.log(`Validating case: ${caseId}`);
    setCases(prevCases =>
      prevCases.map(caseItem =>
        caseItem.id === caseId
          ? { ...caseItem, status: 'validated', labResults: 'Positive for disease pathogen' }
          : caseItem
      )
    );
  };

  const handleInvalidateCase = (caseId: string) => {
    // In a real application, this would send the invalidation to the backend
    console.log(`Invalidating case: ${caseId}`);
    setCases(prevCases =>
      prevCases.map(caseItem =>
        caseItem.id === caseId
          ? { ...caseItem, status: 'invalidated', labResults: 'Negative - not the reported disease' }
          : caseItem
      )
    );
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You must be signed in to view this page
          </p>
          <a
            href="/login"
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors inline-block"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_validation':
        return 'warning';
      case 'validated':
        return 'success';
      case 'invalidated':
        return 'default';
      case 'suspected':
        return 'secondary';
      case 'confirmed':
        return 'danger';
      case 'resolved':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Validation Hub</h1>
        <p className="text-gray-600">
          {session.user?.role === USER_ROLES.LAB_TECHNICIAN
            ? 'Validate cases with lab results'
            : session.user?.role === USER_ROLES.DISTRICT_OFFICER
              ? `Cases requiring validation in ${session.user?.district} district`
              : 'All cases requiring validation'
          }
        </p>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4">
          <button
            className={`px-4 py-2 rounded-lg ${filter === 'all'
              ? 'bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            onClick={() => setFilter('all')}
          >
            All Cases
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${filter === 'pending_validation'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            onClick={() => setFilter('pending_validation')}
          >
            Pending Validation
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${filter === 'validated'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            onClick={() => setFilter('validated')}
          >
            Validated
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${filter === 'invalidated'
              ? 'bg-gray-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            onClick={() => setFilter('invalidated')}
          >
            Invalidated
          </button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Patient</TableHeaderCell>
                <TableHeaderCell>Disease</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Facility</TableHeaderCell>
                <TableHeaderCell>Sample ID</TableHeaderCell>
                <TableHeaderCell>Lab Results</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No cases found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">{caseItem.patientName}</TableCell>
                    <TableCell>{caseItem.disease}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(caseItem.status)}>
                        {caseItem.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{caseItem.date}</TableCell>
                    <TableCell>{caseItem.facility}</TableCell>
                    <TableCell>{caseItem.sampleId || '-'}</TableCell>
                    <TableCell>{caseItem.labResults || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {caseItem.status === 'pending_validation' && session.user?.role === USER_ROLES.LAB_TECHNICIAN && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleValidateCase(caseItem.id)}
                            >
                              Validate
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleInvalidateCase(caseItem.id)}
                            >
                              Invalidate
                            </Button>
                          </>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Lab Link Interface Section */}
      <Card className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lab Results Integration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Upload Lab Results</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-4">Drag and drop lab result files here</p>
              <Button variant="primary">
                Browse Files
              </Button>
              <p className="text-xs text-gray-500 mt-2">Supports CSV, Excel, PDF formats</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Recent Integrations</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Malaria Test Results</p>
                  <p className="text-sm text-gray-600">Jan 25, 2024 • 45 samples</p>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Typhoid Screening</p>
                  <p className="text-sm text-gray-600">Jan 24, 2024 • 32 samples</p>
                </div>
                <Badge variant="success">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Cholera Confirmation</p>
                  <p className="text-sm text-gray-600">Jan 23, 2024 • 18 samples</p>
                </div>
                <Badge variant="processing">Processing</Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ValidationHub;