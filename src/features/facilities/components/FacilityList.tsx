// src/features/facilities/components/FacilityList.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import FacilityCard from './FacilityCard';

interface Facility {
  id: string;
  name: string;
  code: string;
  type: string;
  districtId: string;
  provinceId: string;
  address: {
    street: string;
    sector: string;
    district: string;
    province: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FacilityListProps {
  facilities: Facility[];
  onEdit: (facility: Facility) => void;
  onDelete: (facilityId: string) => void;
  onView: (facility: Facility) => void;
}

const FacilityList: React.FC<FacilityListProps> = ({ facilities, onEdit, onDelete, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filter facilities based on search and filter criteria
  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.address.district.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || facility.type === filterType;
    const matchesDistrict = !filterDistrict || facility.districtId.toLowerCase().includes(filterDistrict.toLowerCase());
    const matchesStatus = !filterStatus || facility.isActive.toString() === filterStatus;
    
    return matchesSearch && matchesType && matchesDistrict && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Facility Management</h2>
        <Button variant="primary">Add New Facility</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            
            <div className="space-y-4">
              <Input
                label="Search Facilities"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, Code, or Location"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facility Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="health_center">Health Center</option>
                  <option value="hospital">Hospital</option>
                  <option value="clinic">Clinic</option>
                  <option value="dispensary">Dispensary</option>
                  <option value="medical_center">Medical Center</option>
                </select>
              </div>
              
              <Input
                label="District ID"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                placeholder="Filter by district"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {filteredFacilities.length > 0 ? (
              filteredFacilities.map(facility => (
                <FacilityCard 
                  key={facility.id} 
                  facility={facility} 
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No facilities found matching your criteria.</p>
              </Card>
            )}
          </div>
          
          {filteredFacilities.length > 0 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </a>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilityList;