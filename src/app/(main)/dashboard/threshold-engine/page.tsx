// src/app/(main)/dashboard/threshold-engine/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { USER_ROLES } from '@/types';

interface ThresholdRule {
  id: string;
  disease: string;
  location: string;
  threshold: number;
  currentValue: number;
  timeFrame: string; // 'day', 'week', 'month'
  isActive: boolean;
  lastTriggered?: string;
}

interface Alert {
  id: string;
  disease: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  date: string;
  acknowledged: boolean;
}

const ThresholdEngine = () => {
  const { data: session, status } = useSession();
  const [thresholdRules, setThresholdRules] = useState<ThresholdRule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRule, setNewRule] = useState({
    disease: '',
    location: '',
    threshold: 5,
    timeFrame: 'week'
  });

  useEffect(() => {
    const loadData = async () => {
      if (status === 'authenticated' && session) {
        try {
          // Generate mock threshold rules based on user's role and location
          let mockRules: ThresholdRule[] = [];
          let mockAlerts: Alert[] = [];

          if (session.user?.role === USER_ROLES.ADMIN) {
            // Admins see all rules and alerts
            mockRules = [
              { id: 'rule-1', disease: 'Cholera', location: 'Rusizi District', threshold: 5, currentValue: 8, timeFrame: 'week', isActive: true, lastTriggered: '2024-02-10' },
              { id: 'rule-2', disease: 'Malaria', location: 'Northern Province', threshold: 50, currentValue: 55, timeFrame: 'week', isActive: true, lastTriggered: '2024-02-11' },
              { id: 'rule-3', disease: 'Measles', location: 'Kigali City', threshold: 3, currentValue: 1, timeFrame: 'week', isActive: true },
              { id: 'rule-4', disease: 'Plague', location: 'National', threshold: 1, currentValue: 0, timeFrame: 'week', isActive: true },
            ];

            mockAlerts = [
              { id: 'alert-1', disease: 'Cholera', location: 'Rusizi District', severity: 'critical', message: 'Threshold exceeded: 8 cases in past week', date: '2024-02-10', acknowledged: false },
              { id: 'alert-2', disease: 'Malaria', location: 'Northern Province', severity: 'high', message: 'Threshold exceeded: 55 cases in past week', date: '2024-02-11', acknowledged: true },
              { id: 'alert-3', disease: 'Measles', location: 'Kigali City', severity: 'medium', message: 'Near threshold: 4 cases in past week', date: '2024-02-09', acknowledged: false },
            ];
          } else if (session.user?.role === USER_ROLES.NATIONAL_OFFICER) {
            // National officers see national rules and alerts
            mockRules = [
              { id: 'rule-1', disease: 'Cholera', location: 'National', threshold: 20, currentValue: 25, timeFrame: 'week', isActive: true, lastTriggered: '2024-02-11' },
              { id: 'rule-2', disease: 'Malaria', location: 'National', threshold: 200, currentValue: 180, timeFrame: 'week', isActive: true },
            ];

            mockAlerts = [
              { id: 'alert-1', disease: 'Cholera', location: 'National', severity: 'high', message: 'Threshold exceeded: 25 cases in past week', date: '2024-02-11', acknowledged: false },
            ];
          } else if (session.user?.role === USER_ROLES.DISTRICT_OFFICER && session.user.district) {
            // District officers see rules for their district
            mockRules = [
              { id: 'rule-1', disease: 'Cholera', location: session.user.district, threshold: 3, currentValue: 4, timeFrame: 'week', isActive: true, lastTriggered: '2024-02-10' },
              { id: 'rule-2', disease: 'Malaria', location: session.user.district, threshold: 15, currentValue: 12, timeFrame: 'week', isActive: true },
            ];

            mockAlerts = [
              { id: 'alert-1', disease: 'Cholera', location: session.user.district, severity: 'high', message: 'Threshold exceeded: 4 cases in past week', date: '2024-02-10', acknowledged: false },
            ];
          }

          setThresholdRules(mockRules);
          setAlerts(mockAlerts);
        } catch (error) {
          console.error('Error loading threshold data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadData();
  }, [status, session]);

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const handleToggleRule = (ruleId: string) => {
    setThresholdRules(prevRules =>
      prevRules.map(rule =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const handleAddRule = () => {
    if (!newRule.disease || !newRule.location || newRule.threshold <= 0) {
      alert('Please fill in all fields correctly');
      return;
    }

    const newThresholdRule: ThresholdRule = {
      id: `rule-${Date.now()}`,
      disease: newRule.disease,
      location: newRule.location,
      threshold: newRule.threshold,
      currentValue: 0,
      timeFrame: newRule.timeFrame,
      isActive: true
    };

    setThresholdRules([...thresholdRules, newThresholdRule]);
    setNewRule({ disease: '', location: '', threshold: 5, timeFrame: 'week' });
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getProgressPercentage = (current: number, threshold: number) => {
    return Math.min(100, (current / threshold) * 100);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Threshold Engine</h1>
        <p className="text-gray-600">
          Monitor disease incidence and configure automated alerts
        </p>
      </div>

      {/* Active Alerts */}
      <Card className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Alerts</h2>
          <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
            {alerts.filter(a => !a.acknowledged).length} Unacknowledged
          </span>
        </div>

        {alerts.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No active alerts</p>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{alert.disease} Alert</h3>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{alert.location} • {alert.date}</p>
                    <p className="mt-2 text-gray-700">{alert.message}</p>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Threshold Rules */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Threshold Rules</h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {thresholdRules.filter(r => r.isActive).length} Active
              </span>
            </div>

            <div className="space-y-4">
              {thresholdRules.map(rule => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{rule.disease} in {rule.location}</h3>
                      <p className="text-sm text-gray-600">
                        Threshold: {rule.threshold} cases per {rule.timeFrame}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.isActive ? 'success' : 'default'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className="text-sm text-blue-700 hover:text-blue-900"
                      >
                        {rule.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current: {rule.currentValue}</span>
                      <span>Threshold: {rule.threshold}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${rule.currentValue >= rule.threshold
                          ? 'bg-red-500'
                          : rule.currentValue >= rule.threshold * 0.8
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          }`}
                        style={{ width: `${getProgressPercentage(rule.currentValue, rule.threshold)}%` }}
                      ></div>
                    </div>
                  </div>

                  {rule.lastTriggered && (
                    <div className="mt-2 text-sm text-gray-600">
                      Last triggered: {rule.lastTriggered}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Add New Rule */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Rule</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disease</label>
                <select
                  value={newRule.disease}
                  onChange={(e) => setNewRule({ ...newRule, disease: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select disease</option>
                  <option value="Cholera">Cholera</option>
                  <option value="Malaria">Malaria</option>
                  <option value="Typhoid">Typhoid</option>
                  <option value="Measles">Measles</option>
                  <option value="Plague">Plague</option>
                  <option value="Yellow Fever">Yellow Fever</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newRule.location}
                  onChange={(e) => setNewRule({ ...newRule, location: e.target.value })}
                  placeholder="District, Province, or National"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
                <input
                  type="number"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Frame</label>
                <select
                  value={newRule.timeFrame}
                  onChange={(e) => setNewRule({ ...newRule, timeFrame: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">Per Day</option>
                  <option value="week">Per Week</option>
                  <option value="month">Per Month</option>
                </select>
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={handleAddRule}
              >
                Add Rule
              </Button>
            </div>
          </Card>

          {/* Configuration Tips */}
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Configuration Tips</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Set lower thresholds for high-risk diseases</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Adjust thresholds based on historical data</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Consider population density in threshold settings</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Regularly review and update thresholds</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThresholdEngine;