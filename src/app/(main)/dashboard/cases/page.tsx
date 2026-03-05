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
import { Case, ValidationStatus, USER_ROLES, UserRole } from '@/types';
import { getCasesWithFilters } from '@/lib/services/caseService';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CaseFilters>({
    status: 'all',
    disease: '',
    dateFrom: '',
    dateTo: ''
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const loadCases = async () => {
      if (status === 'authenticated' && session?.user) {
        setLoading(true);
        try {
          const result = await getCasesWithFilters({
            search: debouncedSearch || undefined,
            diseaseCode: filters.disease || undefined,
            validationStatus: filters.status !== 'all' ? filters.status : undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
            page: currentPage,
            limit: 20,
          });
          setCases(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        } catch (error) {
          console.error('Error loading cases:', error);
          showError('Failed to load cases');
        } finally {
          setLoading(false);
        }
      }
    };

    void loadCases();
  }, [status, session, showError, debouncedSearch, filters, currentPage]);

  const getStatusBadge = (status: ValidationStatus) => {
    const variants = {
      pending: 'default',
      validated: 'default',
      rejected: 'destructive'
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const caseReporterRoles: UserRole[] = [
    USER_ROLES.HEALTH_WORKER,
    USER_ROLES.LAB_TECHNICIAN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.ADMIN,
    USER_ROLES.NATIONAL_OFFICER,
  ];
  const canReportCase = !!session?.user?.role && caseReporterRoles.includes(session.user.role as UserRole);

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
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
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
                onChange={(value) => {
                  setCurrentPage(1);
                  setFilters(prev => ({ ...prev, status: value as ValidationStatus | 'all' }));
                }}
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
                onChange={(value) => {
                  setCurrentPage(1);
                  setFilters(prev => ({ ...prev, disease: value || '' }));
                }}
                options={[
                  { value: '', label: 'All Diseases' },
                  ...DISEASE_CODES.map(d => ({ value: d.code, label: d.name }))
                ]}
              />
              <Input
                label="From Date"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => {
                  setCurrentPage(1);
                  setFilters(prev => ({ ...prev, dateFrom: e.target.value }));
                }}
              />
              <Input
                label="To Date"
                type="date"
                value={filters.dateTo}
                onChange={(e) => {
                  setCurrentPage(1);
                  setFilters(prev => ({ ...prev, dateTo: e.target.value }));
                }}
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
              {cases.length > 0 ? (
                cases.map(caseItem => (
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing page {currentPage} of {totalPages} ({total} total cases)
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
