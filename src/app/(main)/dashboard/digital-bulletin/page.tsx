// src/app/(main)/dashboard/digital-bulletin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { USER_ROLES } from '@/types';

interface Bulletin {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'weekly' | 'monthly' | 'outbreak' | 'special';
  status: 'draft' | 'generated' | 'distributed' | 'scheduled';
  recipients: number;
}

const DigitalBulletin = () => {
  const { data: session, status } = useSession();
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBulletin, setNewBulletin] = useState({
    title: '',
    description: '',
    type: 'weekly' as 'weekly' | 'monthly' | 'outbreak' | 'special',
    scheduleDate: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        try {
          // Generate mock bulletins based on user's role
          let mockBulletins: Bulletin[] = [];

          if (session.user?.role === USER_ROLES.ADMIN) {
            // Admins see all bulletins
            mockBulletins = [
              { id: 'bulletin-1', title: 'Weekly Surveillance Report', description: 'Comprehensive overview of disease surveillance for the week', date: '2024-02-05', type: 'weekly', status: 'distributed', recipients: 1245 },
              { id: 'bulletin-2', title: 'Cholera Outbreak Alert', description: 'Critical alert regarding cholera outbreak in Rusizi District', date: '2024-02-10', type: 'outbreak', status: 'distributed', recipients: 890 },
              { id: 'bulletin-3', title: 'Monthly Epidemiological Summary', description: 'Monthly summary of disease trends and statistics', date: '2024-01-30', type: 'monthly', status: 'distributed', recipients: 1560 },
              { id: 'bulletin-4', title: 'System Maintenance Notice', description: 'Scheduled maintenance for the RIDSR platform', date: '2024-02-15', type: 'special', status: 'scheduled', recipients: 2000 },
            ];
          } else if (session.user?.role === USER_ROLES.NATIONAL_OFFICER) {
            // National officers see national bulletins
            mockBulletins = [
              { id: 'bulletin-1', title: 'Weekly Surveillance Report', description: 'Comprehensive overview of disease surveillance for the week', date: '2024-02-05', type: 'weekly', status: 'distributed', recipients: 890 },
              { id: 'bulletin-2', title: 'Cholera Outbreak Alert', description: 'Critical alert regarding cholera outbreak in Rusizi District', date: '2024-02-10', type: 'outbreak', status: 'distributed', recipients: 650 },
              { id: 'bulletin-3', title: 'System Update Notification', description: 'New features added to the RIDSR platform', date: '2024-02-08', type: 'special', status: 'distributed', recipients: 890 },
            ];
          } else if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.district) {
            // District officers see relevant bulletins
            mockBulletins = [
              { id: 'bulletin-1', title: `Weekly Report for ${session.user.district}`, description: `Disease surveillance summary for ${session.user.district}`, date: '2024-02-05', type: 'weekly', status: 'distributed', recipients: 120 },
              { id: 'bulletin-2', title: 'Cholera Prevention Guidelines', description: 'Updated guidelines for cholera prevention', date: '2024-02-08', type: 'special', status: 'distributed', recipients: 120 },
            ];
          }

          setBulletins(mockBulletins);
        } catch (error) {
          console.error('Error loading bulletins:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [status, session]);

  const handleGeneratePDF = (bulletinId: string) => {
    // In a real application, this would generate and download a PDF
    console.log(`Generating PDF for bulletin: ${bulletinId}`);
    alert(`PDF generation initiated for bulletin ${bulletinId}. In a real application, this would generate and download a PDF.`);
  };

  const handleScheduleBulletin = () => {
    if (!newBulletin.title || !newBulletin.description) {
      alert('Please fill in all required fields');
      return;
    }

    const newBulletinObj: Bulletin = {
      id: `bulletin-${Date.now()}`,
      title: newBulletin.title,
      description: newBulletin.description,
      date: newBulletin.scheduleDate || new Date().toISOString().split('T')[0],
      type: newBulletin.type,
      status: newBulletin.scheduleDate ? 'scheduled' : 'generated',
      recipients: session.user?.role === USER_ROLES.DISTRICT_OFFICER ? 100 : 500
    };

    setBulletins([newBulletinObj, ...bulletins]);
    setNewBulletin({ title: '', description: '', type: 'weekly', scheduleDate: '' });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'info';
      case 'monthly':
        return 'secondary';
      case 'outbreak':
        return 'danger';
      case 'special':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'generated':
        return 'info';
      case 'distributed':
        return 'success';
      case 'scheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (status === "loading" || isLoading) {
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
          <p className="text-gray-600 mb-6">
            You must be signed in to view this page
          </p>
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Digital Bulletin</h1>
        <p className="text-gray-600">
          Automated reports and bulletins for disease surveillance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bulletins List */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Published Bulletins</h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {bulletins.length} Reports
              </span>
            </div>

            <div className="space-y-4">
              {bulletins.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No bulletins available</p>
              ) : (
                bulletins.map(bulletin => (
                  <div key={bulletin.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{bulletin.title}</h3>
                          <Badge variant={getTypeColor(bulletin.type)}>
                            {bulletin.type.charAt(0).toUpperCase() + bulletin.type.slice(1)}
                          </Badge>
                          <Badge variant={getStatusColor(bulletin.status)}>
                            {bulletin.status.charAt(0).toUpperCase() + bulletin.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{bulletin.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{bulletin.date}</span>
                          <span>{bulletin.recipients} recipients</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleGeneratePDF(bulletin.id)}
                        >
                          View PDF
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                        >
                          Distribute
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Create New Bulletin */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Bulletin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newBulletin.title}
                  onChange={(e) => setNewBulletin({ ...newBulletin, title: e.target.value })}
                  placeholder="Bulletin title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newBulletin.description}
                  onChange={(e) => setNewBulletin({ ...newBulletin, description: e.target.value })}
                  placeholder="Brief description of the bulletin content"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newBulletin.type}
                  onChange={(e) => setNewBulletin({ ...newBulletin, type: e.target.value as 'weekly' | 'monthly' | 'outbreak' | 'special' })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weekly">Weekly Report</option>
                  <option value="monthly">Monthly Summary</option>
                  <option value="outbreak">Outbreak Alert</option>
                  <option value="special">Special Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Distribution (Optional)</label>
                <input
                  type="date"
                  value={newBulletin.scheduleDate}
                  onChange={(e) => setNewBulletin({ ...newBulletin, scheduleDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={handleScheduleBulletin}
              >
                {newBulletin.scheduleDate ? 'Schedule Bulletin' : 'Generate Now'}
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Weekly report generated</p>
                  <p className="text-xs text-gray-600">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Distribution completed</p>
                  <p className="text-xs text-gray-600">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Scheduled for tomorrow</p>
                  <p className="text-xs text-gray-600">Feb 12, 2024</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* PDF Generation Info */}
      <Card className="mt-8 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Automated PDF Generation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Weekly Reports</h3>
            <p className="text-sm text-blue-700">Automatically generated every Monday with the previous week&apos;s data</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Outbreak Alerts</h3>
            <p className="text-sm text-green-700">Instantly generated when threshold limits are exceeded</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">Custom Reports</h3>
            <p className="text-sm text-purple-700">Generated on-demand for specific needs</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DigitalBulletin;