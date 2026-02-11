// src/components/search/PatientSearch.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDebounce } from '@/hooks/useDebounce';
import { MockDataService } from '@/lib/mocks/mock-service';

interface Patient {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: {
    street: string;
    sector: string;
    district: string;
    province: string;
    country: string;
  };
  facilityId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
  onCancel: () => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onSelectPatient, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // In a real application, this would fetch from an API
  // For now, we'll use mock data
  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      setPatients([]);
      return;
    }

    const fetchPatients = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // TODO: Fetch patients from API endpoint
        // Using mock service for now
        const allPatients = await MockDataService.getPatients();
        
        // Filter based on search term
        const filtered = allPatients.filter(patient =>
          patient.firstName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          patient.lastName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          patient.nationalId.includes(debouncedSearchTerm) ||
          patient.phone.includes(debouncedSearchTerm)
        );

        setPatients(filtered);
      } catch (err) {
        setError('Failed to search patients');
        console.error('Error searching patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [debouncedSearchTerm]);

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
  };

  return (
    <div className="space-y-6">
      <div>
        <Input
          label="Search Patients"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, national ID, or phone number..."
        />
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
        </div>
      )}

      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {!loading && !error && patients.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Search Results</h3>
          <div className="space-y-3">
            {patients.map(patient => (
              <Card key={patient.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">ID: {patient.nationalId}</p>
                    <p className="text-sm text-gray-600">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Phone: {patient.phone}</p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    Select
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && searchTerm && patients.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No patients found matching your search.</p>
        </Card>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PatientSearch;