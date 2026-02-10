// src/app/(main)/cases/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useToastHelpers } from '@/components/ui/Toast';

interface CaseReport {
  id: string;
  patientName: string;
  disease: string;
  district: string;
  date: string;
  status: 'reported' | 'investigated' | 'confirmed' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export default function CasesPage() {
  const { data: session, status } = useSession();
  const [cases, setCases] = useState<CaseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { success, error } = useToastHelpers();

  if (status === "loading") {
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

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockCases: CaseReport[] = [
      {
        id: 'CASE-001',
        patientName: 'Jean Paul Uwimana',
        disease: 'Cholera',
        district: 'Kigali',
        date: '2024-05-15',
        status: 'confirmed',
        priority: 'high'
      },
      {
        id: 'CASE-002',
        patientName: 'Marie Umutoni',
        disease: 'Malaria',
        district: 'Northern Province',
        date: '2024-05-14',
        status: 'investigated',
        priority: 'medium'
      },
      {
        id: 'CASE-003',
        patientName: 'Pierre Ntaganira',
        disease: 'Typhoid',
        district: 'Southern Province',
        date: '2024-05-14',
        status: 'reported',
        priority: 'low'
      },
      {
        id: 'CASE-004',
        patientName: 'Claire Nyirabazungu',
        disease: 'Measles',
        district: 'Eastern Province',
        date: '2024-05-13',
        status: 'confirmed',
        priority: 'critical'
      },
      {
        id: 'CASE-005',
        patientName: 'Samuel Mugisha',
        disease: 'Plague',
        district: 'Western Province',
        date: '2024-05-12',
        status: 'dismissed',
        priority: 'medium'
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setCases(mockCases);
      setLoading(false);
    }, 800);
  }, []);

  const filteredCases = filter === 'all'
    ? cases
    : cases.filter(c => c.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'info';
      case 'investigated': return 'warning';
      case 'confirmed': return 'danger';
      case 'dismissed': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const refreshData = () => {
    setLoading(true);
    success('Refreshing data...');
    setTimeout(() => {
      setLoading(false);
      success('Data refreshed successfully!');
    }, 800);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Case Reports</h1>
            <p className="text-gray-600">View and manage reported disease cases</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="investigated">Investigated</option>
              <option value="confirmed">Confirmed</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Patient</TableHeaderCell>
                  <TableHeaderCell>Disease</TableHeaderCell>
                  <TableHeaderCell>District</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Priority</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length > 0 ? (
                  filteredCases.map((caseReport) => (
                    <TableRow key={caseReport.id}>
                      <TableCell className="font-medium">{caseReport.id}</TableCell>
                      <TableCell>{caseReport.patientName}</TableCell>
                      <TableCell>{caseReport.disease}</TableCell>
                      <TableCell>{caseReport.district}</TableCell>
                      <TableCell>{caseReport.date}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(caseReport.status)}>
                          {caseReport.status.charAt(0).toUpperCase() + caseReport.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(caseReport.priority)}>
                          {caseReport.priority.charAt(0).toUpperCase() + caseReport.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button 
                          className="text-blue-700 hover:text-blue-900 text-sm font-medium"
                          onClick={() => success(`Viewing details for ${caseReport.patientName}`)}
                        >
                          View Details
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No cases found matching your filter criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}