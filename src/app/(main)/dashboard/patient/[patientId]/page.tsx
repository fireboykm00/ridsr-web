'use client';

import Link from 'next/link';

export default function PatientDetailPage({ params }: { params: { patientId: string } }) {
  // TODO: Fetch patient data from API using params.patientId
  const patientData = {
    id: params.patientId,
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    phone: '+256 700 123456',
    email: '<email>',
    district: 'Kampala',
    facility: 'Central Hospital',
    medicalHistory: ['Hypertension', 'Diabetes'],
    activeCases: 1,
    resolvedCases: 2,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{patientData.name}</h1>
          <p className="text-gray-600">Patient Details</p>
        </div>
        <Link href="/dashboard/patient" className="text-blue-600 hover:underline">
          Back to Patients
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demographics</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="text-gray-900 font-medium">{patientData.age} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="text-gray-900 font-medium">{patientData.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-900 font-medium">{patientData.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900 font-medium">{patientData.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">District</p>
              <p className="text-gray-900 font-medium">{patientData.district}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Facility</p>
              <p className="text-gray-900 font-medium">{patientData.facility}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h2>
        <div className="flex flex-wrap gap-2">
          {patientData.medicalHistory.map(condition => (
            <span key={condition} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              {condition}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Summary</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Active Cases</p>
              <p className="text-2xl font-bold text-red-600">{patientData.activeCases}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved Cases</p>
              <p className="text-2xl font-bold text-green-600">{patientData.resolvedCases}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
