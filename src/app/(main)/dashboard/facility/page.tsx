'use client';

import { useState } from 'react';
import { MOCK_FACILITIES } from '@/lib/mock-data';
import Link from 'next/link';

export default function FacilityListPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFacilities = MOCK_FACILITIES.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facilities</h1>
        <p className="text-gray-600">Manage and monitor health facilities</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <input
          type="text"
          placeholder="Search facilities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map(facility => (
          <Link key={facility.id} href={`/dashboard/facility/${facility.id}`}>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{facility.type}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{facility.district}</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No facilities found</p>
        </div>
      )}
    </div>
  );
}
