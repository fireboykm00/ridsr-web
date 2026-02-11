// src/features/facilities/components/FacilityCard.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

interface FacilityCardProps {
  facility: Facility;
  onEdit: (facility: Facility) => void;
  onDelete: (facilityId: string) => void;
  onView: (facility: Facility) => void;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onEdit, onDelete, onView }) => {
  // Format type for display
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'health_center':
        return 'Health Center';
      case 'hospital':
        return 'Hospital';
      case 'clinic':
        return 'Clinic';
      case 'dispensary':
        return 'Dispensary';
      case 'medical_center':
        return 'Medical Center';
      default:
        return type;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-medium">
                {facility.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
              <p className="text-gray-600">{facility.code} • {getTypeLabel(facility.type)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {facility.address.street}, {facility.address.sector}, {facility.address.district}
              </p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">{facility.address.district}, {facility.address.province}</p>
            </div>
            <div>
              <p className="text-gray-500">Coordinates</p>
              <p className="font-medium">{facility.coordinates.latitude.toFixed(6)}, {facility.coordinates.longitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className={`font-medium ${facility.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {facility.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium">{formatDate(facility.createdAt)}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => onView(facility)}
          >
            View
          </Button>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => onEdit(facility)}
          >
            Edit
          </Button>
          <Button 
            variant="tertiary" 
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(facility.id)}
          >
            {facility.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FacilityCard;