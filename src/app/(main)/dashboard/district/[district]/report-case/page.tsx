'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import CaseReportForm from '@/components/forms/CaseReportForm';
import { USER_ROLES, RwandaDistrictType } from '@/types';

export default function DistrictCaseReportPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const district = params.district as RwandaDistrictType;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You must be signed in to view this page</p>
          <a
            href="/login"
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors inline-block"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  const role = session.user?.role;
  const canReport = [
    USER_ROLES.ADMIN,
    USER_ROLES.NATIONAL_OFFICER,
    USER_ROLES.DISTRICT_OFFICER,
  ].includes(role as string);

  const districtMatches =
    role !== USER_ROLES.DISTRICT_OFFICER || session.user?.district === district;

  if (!canReport || !districtMatches) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to report cases for this district.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Case Reporting Form</h1>
          <p className="text-gray-600">
            Report suspected or confirmed cases of epidemic-prone diseases in {district}
          </p>
        </div>

        <CaseReportForm onCancel={() => router.push('/dashboard')} />
      </div>
    </div>
  );
}
