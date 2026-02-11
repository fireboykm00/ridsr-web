// src/app/(main)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToastHelpers } from '@/components/ui/Toast';

const ProfilePage = () => {
  const { data: session, status, update } = useSession();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    facility: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToastHelpers();

  useEffect(() => {
    if (session) {
      setUserData({
        name: session.user?.name || '',
        email: session.user?.email || '',
        role: session.user?.role || '',
        facility: session.user?.facility || ''
      });
      setLoading(false);
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real application, this would update the user in the database
      // For now, we'll just simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: userData.name,
          facility: userData.facility
        }
      });

      success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          {!isEditing && (
            <Button 
              variant="secondary" 
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
        
        <Card className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Input
                    label="Full Name"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    disabled
                    helperText="Email cannot be changed"
                  />
                </div>
                <div>
                  <Input
                    label="Role"
                    name="role"
                    value={userData.role}
                    onChange={handleInputChange}
                    disabled
                    helperText="Role can only be changed by administrators"
                  />
                </div>
                <div>
                  <Input
                    label="Facility/Institution"
                    name="facility"
                    value={userData.facility}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original values
                    setUserData({
                      name: session.user?.name || '',
                      email: session.user?.email || '',
                      role: session.user?.role || '',
                      facility: session.user?.facility || ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{userData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{userData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium capitalize">
                      {userData.role.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Facility/Institution</p>
                    <p className="font-medium">{userData.facility || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium">January 2024</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="font-medium">Today</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-green-600">Active</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Security</h4>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => success('Change password functionality would be implemented here')}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;