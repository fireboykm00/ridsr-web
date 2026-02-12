// src/components/search/PatientSearch.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SearchableSelect, SelectOption } from '@/components/ui/SearchableSelect';
import { Card } from '@/components/ui/Card';
import { Patient } from '@/types';

interface PatientSearchProps {
  onSelectPatient?: (patient: Patient) => void;
  onCancel?: () => void;
  onPatientSelect?: (patient: Patient | null) => void;
  selectedPatientId?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  showActions?: boolean;
}

const PatientSearch: React.FC<PatientSearchProps> = ({ 
  onSelectPatient,
  onCancel,
  onPatientSelect,
  selectedPatientId,
  placeholder = "Search by name, national ID, or phone number...",
  error,
  disabled = false,
  showActions = true
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(selectedPatientId || null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string): Promise<SelectOption<string>[]> => {
    if (!query.trim() || query.length < 2) return [];
    
    setLoading(true);
    try {
      const response = await fetch(`/api/patients/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const result = await response.json();
      const patients = result.data || [];
      
      return patients.map((patient: Patient) => ({
        value: patient.id,
        label: `${patient.firstName} ${patient.lastName} (${patient.nationalId})`,
        data: patient
      }));
    } catch (error) {
      console.error('Patient search error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handlePatientChange = (value: string | null, option?: SelectOption<string>) => {
    setSelectedId(value);
    
    if (value && option?.data) {
      const patient = option.data as Patient;
      setSelectedPatient(patient);
      onPatientSelect?.(patient);
    } else {
      setSelectedPatient(null);
      onPatientSelect?.(null);
    }
  };

  const handleSelectPatient = async () => {
    if (!selectedId) return;

    try {
      if (selectedPatient) {
        onSelectPatient?.(selectedPatient);
      } else {
        // Fallback: fetch patient data if not available
        const response = await fetch(`/api/patients/${selectedId}`);
        if (!response.ok) throw new Error('Failed to fetch patient');
        
        const result = await response.json();
        const patient = result.data;
        onSelectPatient?.(patient);
      }
    } catch (error) {
      console.error('Error selecting patient:', error);
    }
  };

  const handleCreateNewPatient = () => {
    // This could open a modal or navigate to patient creation page
    console.log('Create new patient clicked');
    // For now, just clear selection
    setSelectedId(null);
    setSelectedPatient(null);
    onPatientSelect?.(null);
  };

  return (
    <div className="space-y-4">
      <SearchableSelect<string>
        label="Search Patients"
        placeholder={placeholder}
        value={selectedId}
        onChange={handlePatientChange}
        onSearch={handleSearch}
        isLoading={loading}
        isClearable
        error={error}
        disabled={disabled}
        helperText="Type at least 2 characters to search"
      />

      {selectedPatient && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Selected Patient</h4>
            <div className="text-sm text-blue-800">
              <p><span className="font-medium">Name:</span> {selectedPatient.firstName} {selectedPatient.lastName}</p>
              <p><span className="font-medium">National ID:</span> {selectedPatient.nationalId}</p>
              <p><span className="font-medium">Gender:</span> {selectedPatient.gender}</p>
              <p><span className="font-medium">District:</span> {selectedPatient.district}</p>
              <p><span className="font-medium">Date of Birth:</span> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
              {selectedPatient.phone && (
                <p><span className="font-medium">Phone:</span> {selectedPatient.phone}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {showActions && (
        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCreateNewPatient}
            disabled={disabled}
          >
            + Create New Patient
          </Button>
          
          <div className="flex space-x-4">
            {onCancel && (
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
            )}
            {onSelectPatient && (
              <Button 
                type="button" 
                variant="primary"
                onClick={handleSelectPatient}
                disabled={!selectedId || disabled}
              >
                Select Patient
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSearch;