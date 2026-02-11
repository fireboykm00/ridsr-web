'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Case } from '@/types';

export default function CaseListPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // TODO: Fetch cases from API endpoint
  const cases: Case[] = [];

  const filteredCases = cases.filter((c: Case) =>
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cases</h1>
        <p className="text-gray-600">View and manage disease cases</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <input
          type="text"
          placeholder="Search cases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Case ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Disease</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map(caseItem => (
              <tr key={caseItem.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  <Link href={`/dashboard/case/${caseItem.id}`} className="text-blue-600 hover:underline">
                    {caseItem.id}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{caseItem.patientId}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{caseItem.diseaseCode}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${caseItem.validationStatus === 'pending' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {caseItem.validationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{caseItem.reportDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No cases found</p>
        </div>
      )}
    </div>
  );
}
