'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useToastHelpers } from '@/components/ui/Toast';
import { UserIcon, CogIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SettingsData {
  emailNotifications: boolean;
  smsAlerts: boolean;
  twoFactorAuth: boolean;
  weeklyReports: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile');
  const [loading, setLoading] = useState(false);
  const { error: showError, success } = useToastHelpers();

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});

  // Initialize profile data from session
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '',
      });
    }
  }, [session]);

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});

  // Settings state
  const [settings, setSettings] = useState<SettingsData>({
    emailNotifications: true,
    smsAlerts: false,
    twoFactorAuth: false,
    weeklyReports: true,
  });

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You must be logged in to view this page.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const validateProfileForm = (): boolean => {
    const errors: FormErrors = {};

    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (profileData.phone && !/^\+?[\d\s-()]+$/.test(profileData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: FormErrors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        await update({ name: profileData.name, email: profileData.email });
        success('Profile updated successfully');
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to update profile');
      }
    } catch {
      showError('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        success('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to update password');
      }
    } catch {
      showError('An error occurred while updating password');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        success('Settings updated successfully');
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to update settings');
      }
    } catch {
      showError('An error occurred while updating settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch {
      showError('Error signing out');
    }
  };

  const tabs: Array<{ id: 'profile' | 'password' | 'settings'; label: string; icon: typeof UserIcon }> = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'password', label: 'Password', icon: ShieldCheckIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Account Management</h1>
          <Button
            onClick={handleSignOut}
            variant="tertiary"
            className="flex items-center gap-2 border"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${activeTab === tab.id
                          ? 'bg-primary/5 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* User Info Card */}
            <Card className="p-4 mt-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium text-foreground">{session.user.name}</h3>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Role: {session.user.role?.replace('_', ' ').toUpperCase()}
                </p>
                {session.user.workerId && (
                  <p className="text-xs text-muted-foreground/60">
                    ID: {session.user.workerId}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => {
                      setProfileData({ ...profileData, name: e.target.value });
                      if (profileErrors.name) {
                        setProfileErrors({ ...profileErrors, name: '' });
                      }
                    }}
                    error={profileErrors.name}
                    required
                    disabled={loading}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => {
                      setProfileData({ ...profileData, email: e.target.value });
                      if (profileErrors.email) {
                        setProfileErrors({ ...profileErrors, email: '' });
                      }
                    }}
                    error={profileErrors.email}
                    required
                    disabled={loading}
                  />

                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => {
                      setProfileData({ ...profileData, phone: e.target.value });
                      if (profileErrors.phone) {
                        setProfileErrors({ ...profileErrors, phone: '' });
                      }
                    }}
                    error={profileErrors.phone}
                    placeholder="+250 XXX XXX XXX"
                    disabled={loading}
                  />

                  <Input
                    label="Role"
                    value={session.user.role?.replace('_', ' ').toUpperCase() || 'Not assigned'}
                    disabled
                    helperText="Contact your administrator to change your role"
                  />

                  <Input
                    label="Facility"
                    value={session.user.facilityId || 'Not assigned'}
                    disabled
                    helperText="Contact your administrator to change your facility"
                  />

                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loading}
                    className="w-full"
                  >
                    Save Profile Changes
                  </Button>
                </form>
              </Card>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <PasswordInput
                    label="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, currentPassword: e.target.value });
                      if (passwordErrors.currentPassword) {
                        setPasswordErrors({ ...passwordErrors, currentPassword: '' });
                      }
                    }}
                    error={passwordErrors.currentPassword}
                    required
                    disabled={loading}
                  />

                  <PasswordInput
                    label="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, newPassword: e.target.value });
                      if (passwordErrors.newPassword) {
                        setPasswordErrors({ ...passwordErrors, newPassword: '' });
                      }
                    }}
                    error={passwordErrors.newPassword}
                    helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                    required
                    disabled={loading}
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                      }
                    }}
                    error={passwordErrors.confirmPassword}
                    required
                    disabled={loading}
                  />

                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loading}
                    className="w-full"
                  >
                    Update Password
                  </Button>
                </form>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Checkbox
                      id="emailNotifications"
                      label="Email Notifications"
                      checked={settings.emailNotifications}
                      onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground ml-7 -mt-2">Receive email notifications for case updates and alerts</p>

                    <Checkbox
                      id="smsAlerts"
                      label="SMS Alerts"
                      checked={settings.smsAlerts}
                      onChange={(checked) => setSettings({ ...settings, smsAlerts: checked })}
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground ml-7 -mt-2">Receive SMS alerts for urgent cases and outbreaks</p>

                    <Checkbox
                      id="weeklyReports"
                      label="Weekly Reports"
                      checked={settings.weeklyReports}
                      onChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground ml-7 -mt-2">Receive weekly summary reports via email</p>

                    <Checkbox
                      id="twoFactorAuth"
                      label="Two-Factor Authentication"
                      checked={settings.twoFactorAuth}
                      onChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground ml-7 -mt-2">Enable two-factor authentication for enhanced security</p>
                  </div>

                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loading}
                    className="w-full"
                  >
                    Save Settings
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
