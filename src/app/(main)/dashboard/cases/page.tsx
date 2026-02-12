'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Badge } from '@/components/ui/Badge';
import { useToastHelpers } from '@/components/ui/Toast';
import { DocumentTextIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Case, ValidationStatus, USER_ROLES } from '@/types';
import { getAllCases, filterCasesByAccess } from '@/lib/services/caseService';
import { useDebounce } from '@/hooks/useDebounce';
import { DISEASE_CODES } from '@/constants';

interface CaseFilters {
  status: ValidationStatus | 'all';
  disease: string;
  dateFrom: string;
  dateTo: string;
}

export default function CaseListPage() {
  const { data: session, status } = useSession();
  const { error: showError } = useToastHelpers();
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CaseFilters>({
    status: 'all',
    disease: '',
    dateFrom: '',
    dateTo: ''
  });

  const debouncedSearch = useDebounce(searchTerm, 300);
  const itemsPerPage = 20;

  useEffect(() => {
    const loadCases = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          const allCases = await getAllCases();
          const accessibleCases = filterCasesByAccess(allCases, session.user);
          setCases(accessibleCases);
        } catch (error) {
          console.error('Error loading cases:', error);
          showError('Failed to load cases');
        } finally {
          setLoading(false);
        }
      }
    };

    loadCases();
  }, [status, session, showError]);

  useEffect(() => {
    let filtered = cases;

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(c =>
        c.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.patientId.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.diseaseCode.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.validationStatus === filters.status);
    }

    // Disease filter
    if (filters.disease) {
      filtered = filtered.filter(c =>
        c.diseaseCode.toLowerCase().includes(filters.disease.toLowerCase())
      );
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(c =>
        new Date(c.reportDate) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(c =>
        new Date(c.reportDate) <= new Date(filters.dateTo)
      );
    }

    setFilteredCases(filtered);
    setCurrentPage(1);
  }, [cases, debouncedSearch, filters]);

  const safeFilteredCases = Array.isArray(filteredCases) ? filteredCases : [];

  const getStatusBadge = (status: ValidationStatus) => {
    const variants = {
      pending: 'default',
      validated: 'default',
      rejected: 'destructive'
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const canReportCase = session?.user?.role && [
    USER_ROLES.HEALTH_WORKER,
    USER_ROLES.LAB_TECHNICIAN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.ADMIN
  ].includes(session.user.role);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please sign in to view cases</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
          <p className="text-gray-600">View and manage disease cases</p>
        </div>
        {canReportCase && (
          <Link href="/dashboard/report-case">
            <Button className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              Report Case
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by case ID, patient ID, or disease..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SearchableSelect
                label="Status"
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value as ValidationStatus | 'all' }))}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'validated', label: 'Validated' },
                  { value: 'rejected', label: 'Rejected' }
                ]}
              />
              <SearchableSelect
                label="Disease"
                value={filters.disease}
                onChange={(value) => setFilters(prev => ({ ...prev, disease: value || '' }))}
                options={[
                  { value: '', label: 'All Diseases' },
                  ...DISEASE_CODES.map(d => ({ value: d.code, label: d.name }))
                ]}
              />
              <Input
                label="From Date"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
              <Input
                label="To Date"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Cases Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Case ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Disease</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Report Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {safeFilteredCases.length > 0 ? (
                safeFilteredCases.map(caseItem => (
                  <tr key={caseItem.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/cases/${caseItem.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {caseItem.id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{caseItem.patientId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{caseItem.diseaseCode}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(caseItem.validationStatus)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(caseItem.reportDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {caseItem.outcome ? (
                        <Badge variant={caseItem.outcome === 'recovered' ? 'success' : 'error'}>
                          {caseItem.outcome}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
                    <p className="text-gray-600">
                      {searchTerm || Object.values(filters).some(f => f && f !== 'all')
                        ? 'Try adjusting your search or filters'
                        : 'No cases have been reported yet'
                      }
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
