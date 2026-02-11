'use client';

import { useState } from 'react';
import { MOCK_DISTRICTS } from '@/lib/mock-data';
import Link from 'next/link';

export default function DistrictListPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDistricts = MOCK_DISTRICTS.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Districts</h1>
        <p className="text-gray-600">Manage and monitor districts</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <input
          type="text"
          placeholder="Search districts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDistricts.map(district => (
          <Link key={district.id} href={`/dashboard/district/${district.id}`}>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900">{district.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{district.cases || 0} cases</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{district.facilities || 0}</span> facilities
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredDistricts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No districts found</p>
        </div>
      )}
    </div>
  );
}
