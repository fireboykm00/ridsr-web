'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Input } from '@/components/ui/Input';
import { BellIcon } from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  signature?: string;
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
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [districtFilter, setDistrictFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  useEffect(() => {
    const loadAlerts = async () => {
      if (status === 'authenticated' && session) {
        try {
          const params = new URLSearchParams({ status: statusFilter });
          if (severityFilter) params.set('severity', severityFilter);
          if (districtFilter) params.set('district', districtFilter);
          if (dateFromFilter) params.set('dateFrom', dateFromFilter);
          if (dateToFilter) params.set('dateTo', dateToFilter);

          const response = await fetch(`/api/alerts?${params.toString()}`);
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

    void loadAlerts();
  }, [status, session, statusFilter, severityFilter, districtFilter, dateFromFilter, dateToFilter]);

  const handleResolve = async (alertItem: Alert) => {
    try {
      const response = await fetch(`/api/alerts/${alertItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          signature: alertItem.signature,
          district: alertItem.district,
          severity: alertItem.severity,
          title: alertItem.title,
          description: alertItem.description,
          triggerDate: alertItem.triggerDate,
        }),
      });

      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== alertItem.id));
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <BellIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Active Alerts</h1>
        <Badge variant="secondary">{alerts.length}</Badge>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <SearchableSelect
            placeholder="Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter((value as 'active' | 'resolved' | 'all') || 'active')}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'all', label: 'All' },
            ]}
          />
          <SearchableSelect
            placeholder="Severity"
            value={severityFilter}
            onChange={(value) => setSeverityFilter(value || '')}
            options={[
              { value: '', label: 'All Severities' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
          />
          <Input
            placeholder="District"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          />
          <Input
            type="date"
            value={dateFromFilter}
            onChange={(e) => setDateFromFilter(e.target.value)}
          />
          <Input
            type="date"
            value={dateToFilter}
            onChange={(e) => setDateToFilter(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => {
              setSeverityFilter('');
              setStatusFilter('active');
              setDistrictFilter('');
              setDateFromFilter('');
              setDateToFilter('');
            }}
          >
            Clear
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No active alerts</p>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{alert.title}</h3>
                    <Badge variant={getSeverityVariant(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>District: {alert.district}</span>
                    <span>{new Date(alert.triggerDate).toLocaleString()}</span>
                  </div>
                </div>
                {alert.status === 'active' && (
                  <Button
                    onClick={() => handleResolve(alert)}
                    variant="outline"
                    size="sm"
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
