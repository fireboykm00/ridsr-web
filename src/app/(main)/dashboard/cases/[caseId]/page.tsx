'use client';

import Link from 'next/link';

export default function CaseDetailPage({ params }: { params: { caseId: string } }) {
  // TODO: Fetch case data from API using params.caseId
  const caseData = {
    id: params.caseId,
    caseId: 'CASE-001',
    patientName: 'John Doe',
    disease: 'Measles',
    status: 'Active',
    date: '2024-02-10',
    facility: 'Central Hospital',
    district: 'Kampala',
    symptoms: ['Fever', 'Rash', 'Cough'],
    labResults: 'Positive',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{caseData.caseId}</h1>
          <p className="text-gray-600">Case Details</p>
        </div>
        <Link href="/dashboard/case" className="text-blue-600 hover:underline">
          Back to Cases
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-gray-900 font-medium">{caseData.patientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Disease</p>
              <p className="text-gray-900 font-medium">{caseData.disease}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                caseData.status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {caseData.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Facility Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Facility</p>
              <p className="text-gray-900 font-medium">{caseData.facility}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">District</p>
              <p className="text-gray-900 font-medium">{caseData.district}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Report Date</p>
              <p className="text-gray-900 font-medium">{caseData.date}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {caseData.symptoms.map(symptom => (
                <span key={symptom} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {symptom}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Lab Results</p>
            <p className="text-gray-900 font-medium">{caseData.labResults}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
