'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { USER_ROLES } from '@/types';
import { getAllCases, updateCase } from '@/lib/services/caseService';
import { useRouter } from 'next/navigation';

interface Case {
  id: string;
  patientId: string;
  diseaseCode: string;
  validationStatus: string;
  reportDate: string;
  facilityId: string;
}

export default function ValidationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingCases, setPendingCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCases = async () => {
      if (status === 'authenticated' && session) {
        try {
          // Only allow authorized roles to access this page
          if (![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER].includes(session.user?.role as USER_ROLES)) {
            router.push('/dashboard');
            return;
          }

          // Get cases that need validation
          const allCases = await getAllCases();
          const pendingValidationCases = allCases.filter(
            (c: Case) => c.validationStatus === 'pending'
          );
          
          setPendingCases(pendingValidationCases);
        } catch (error) {
          console.error('Error loading cases:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCases();
  }, [status, session, router]);

  const handleValidateCase = async (caseId: string) => {
    try {
      // Update case validation status
      await updateCase(caseId, { validationStatus: 'validated' });
      
      // Refresh the list
      setPendingCases(pendingCases.filter(c => c.id !== caseId));
    } catch (error) {
      console.error('Error validating case:', error);
    }
  };

  const handleRejectCase = async (caseId: string) => {
    try {
      // Update case validation status
      await updateCase(caseId, { validationStatus: 'rejected' });
      
      // Refresh the list
      setPendingCases(pendingCases.filter(c => c.id !== caseId));
    } catch (error) {
      console.error('Error rejecting case:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!session || ![USER_ROLES.ADMIN, USER_ROLES.NATIONAL_OFFICER, USER_ROLES.DISTRICT_OFFICER].includes(session.user?.role as USER_ROLES)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only authorized personnel can validate cases</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Case Validation</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cases Requiring Validation</h2>
          
          {pendingCases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No cases requiring validation at this time</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Case ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Disease</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Report Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Facility</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCases.map((caseItem) => (
                    <tr key={caseItem.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{caseItem.id.substring(0, 8)}</td>
                      <td className="py-3 px-4 text-gray-900">{caseItem.patientId}</td>
                      <td className="py-3 px-4 text-gray-900">{caseItem.diseaseCode}</td>
                      <td className="py-3 px-4 text-gray-900">{new Date(caseItem.reportDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-900">{caseItem.facilityId}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleValidateCase(caseItem.id)}
                          >
                            Validate
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRejectCase(caseItem.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
