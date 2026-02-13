'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BellIcon } from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  triggerDate: string;
  district: string;
}

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      if (status === 'authenticated' && session) {
        try {
          const response = await fetch('/api/alerts?status=active');
          if (response.ok) {
            const data = await response.json();
            setAlerts(data.data || []);
          }
        } catch (error) {
          console.error('Error loading alerts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAlerts();
  }, [status, session]);

  const handleResolve = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve' }),
      });

      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger'; // Using 'danger' instead of 'destructive'
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-8 flex items-center gap-3">
          <BellIcon className="h-6 w-6 text-blue-700" />
          <h1 className="text-2xl font-bold text-gray-900">Active Alerts</h1>
          <Badge variant="secondary">{alerts.length}</Badge>
        </div>

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600">No active alerts</p>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                      <Badge variant={getSeverityVariant(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>District: {alert.district}</span>
                      <span>{new Date(alert.triggerDate).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleResolve(alert.id)}
                    variant="outline"
                    size="sm"
                  >
                    Resolve
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
