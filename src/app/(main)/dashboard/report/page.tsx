'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { DocumentTextIcon, PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface Report {
  id: string;
  title: string;
  type: string;
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'published';
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        try {
          // TODO: Fetch from API
          setReports([]);
        } catch (error) {
          console.error('Error loading reports:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [status, session]);

  const filteredReports = reports.filter(report =>
    (filterType === '' || report.type === filterType) &&
    report.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-6 w-6 text-blue-700" />
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          </div>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Generate Report
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
            />

            <SearchableSelect
              label="Type"
              value={filterType}
              onChange={(value) => setFilterType(value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'annual', label: 'Annual' }
              ]}
            />
          </div>
        </Card>

        {/* Reports Table */}
        <Card className="p-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No reports found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Created By</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{report.title}</td>
                      <td className="py-3 px-4 text-gray-900 capitalize">{report.type}</td>
                      <td className="py-3 px-4 text-gray-900">{report.createdBy}</td>
                      <td className="py-3 px-4 text-gray-900">{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
