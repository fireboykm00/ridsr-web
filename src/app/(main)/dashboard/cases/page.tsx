// src/app/(main)/dashboard/cases/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { USER_ROLES } from '@/types';
import { facilityService } from '@/lib/services/facility-service';

interface Case {
  id: string;
  patientName: string;
  disease: string;
  status: 'suspected' | 'confirmed' | 'resolved' | 'invalidated';
  date: string;
  reporter: string;
  facility: string;
  district: string;
}

const CasesDashboard = () => {
  const { data: session, status } = useSession();
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadCases = async () => {
      if (status === 'authenticated' && session) {
        try {
          // In a real application, this would fetch from the database
          // For now, we'll generate mock cases based on user's role and location
          let mockCases: Case[] = [];

          if (session.user?.role === USER_ROLES.ADMIN) {
            // Admins see all cases
            mockCases = Array.from({ length: 20 }, (_, i) => ({
              id: `case-${i + 1}`,
              patientName: `Patient ${i + 1}`,
              disease: ['Malaria', 'Cholera', 'Typhoid', 'Measles'][i % 4],
              status: ['suspected', 'confirmed', 'resolved', 'invalidated'][i % 4] as 'suspected' | 'confirmed' | 'resolved' | 'invalidated',
              date: `2024-01-${20 + (i % 10)}`,
              reporter: `Health Worker ${i % 5 + 1}`,
              facility: ['Kigali Central Hospital', 'Ruhengeri Hospital', 'Nyamata Health Center'][i % 3],
              district: ['Gasabo', 'Ruhengeri', 'Bugesera'][i % 3],
            }));
          } else if (session.user?.role === USER_ROLES.NATIONAL_OFFICER) {
            // National officers see all cases
            mockCases = Array.from({ length: 15 }, (_, i) => ({
              id: `case-${i + 1}`,
              patientName: `Patient ${i + 1}`,
              disease: ['Malaria', 'Cholera', 'Typhoid', 'Measles'][i % 4],
              status: ['suspected', 'confirmed', 'resolved', 'invalidated'][i % 4] as 'suspected' | 'confirmed' | 'resolved' | 'invalidated',
              date: `2024-01-${20 + (i % 10)}`,
              reporter: `Health Worker ${i % 5 + 1}`,
              facility: ['Kigali Central Hospital', 'Ruhengeri Hospital', 'Nyamata Health Center'][i % 3],
              district: ['Gasabo', 'Ruhengeri', 'Bugesera'][i % 3],
            }));
          } else if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.districtIdId) {
            // District officers see cases in their district
            mockCases = Array.from({ length: 12 }, (_, i) => ({
              id: `case-${i + 1}`,
              patientName: `Patient ${i + 1}`,
              disease: ['Malaria', 'Cholera', 'Typhoid'][i % 3],
              status: ['suspected', 'confirmed', 'resolved'][i % 3] as 'suspected' | 'confirmed' | 'resolved',
              date: `2024-01-${20 + (i % 8)}`,
              reporter: `Health Worker ${i % 4 + 1}`,
              facility: ['Kigali Central Hospital', 'Gikondo Health Center'][i % 2],
              district: session.user.district,
            }));
          } else if ([USER_ROLES.HEALTH_WORKER, USER_ROLES.LAB_TECHNICIAN].includes(session.user?.role as string) && session.user.facilityId) {
            // Health workers and lab technicians see cases from their facility
            const facility = await facilityService.getFacilityById(session.user.facilityId);
            mockCases = Array.from({ length: 8 }, (_, i) => ({
              id: `case-${i + 1}`,
              patientName: `Patient ${i + 1}`,
              disease: ['Malaria', 'Cholera'][i % 2],
              status: ['suspected', 'confirmed'][i % 2] as 'suspected' | 'confirmed',
              date: `2024-01-${22 + i}`,
              reporter: session.user?.name || 'Current User',
              facility: facility?.name || 'Current Facility',
              district: facility?.district || session.user?.district || 'Unknown',
            }));
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
      case 'suspected':
        return 'warning';
      case 'confirmed':
        return 'danger';
      case 'resolved':
        return 'success';
      case 'invalidated':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
        <p className="text-gray-600">
          {session.user?.role === USER_ROLES.DISTRICT_OFFICER
            ? `Cases in ${session.user?.district} district`
            : session.user?.role === USER_ROLES.HEALTH_WORKER || session.user?.role === USER_ROLES.LAB_TECHNICIAN
              ? `Cases from your facility`
              : 'All reported cases'
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
            className={`px-4 py-2 rounded-lg ${filter === 'suspected'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            onClick={() => setFilter('suspected')}
          >
            Suspected
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${filter === 'confirmed'
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${filter === 'resolved'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            onClick={() => setFilter('resolved')}
          >
            Resolved
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
                <TableHeaderCell>Reporter</TableHeaderCell>
                <TableHeaderCell>Facility</TableHeaderCell>
                <TableHeaderCell>District</TableHeaderCell>
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
                        {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{caseItem.date}</TableCell>
                    <TableCell>{caseItem.reporter}</TableCell>
                    <TableCell>{caseItem.facility}</TableCell>
                    <TableCell>{caseItem.district}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button className="text-blue-700 hover:text-blue-900 text-sm font-medium">
                          View
                        </button>
                        {session.user?.role !== USER_ROLES.HEALTH_WORKER && (
                          <button className="text-green-700 hover:text-green-900 text-sm font-medium">
                            Validate
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default CasesDashboard;