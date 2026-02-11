// src/app/(main)/register/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useToastHelpers } from '@/components/ui/Toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    facility: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { error: showError, success } = useToastHelpers();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // In a real application, you would send this data to your API to create a user
      // For this demo, we'll just simulate the registration process
      
      // After successful registration, sign in the user
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        // Handle specific error messages
        if (result.error.includes('CredentialsSignin')) {
          showError('Invalid email or password. Please try again.');
        } else {
          showError(result.error);
        }
        setLoading(false);
      } else {
        // Registration successful, redirect to dashboard
        success('Registration successful! Redirecting to dashboard...');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      showError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
      console.error('Registration error:', err);
    }
  };

  // Options for role selection
  const roles = [
    { value: '', label: 'Select your role' },
    { value: 'health_worker', label: 'Health Worker' },
    { value: 'district_officer', label: 'District Officer' },
    { value: 'lab_technician', label: 'Lab Technician' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-700 flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the Rwanda National Integrated Disease Surveillance Platform
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
          
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          
          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roles}
            required
          />
          
          <Input
            label="Health Facility/Institution"
            type="text"
            name="facility"
            value={formData.facility}
            onChange={handleChange}
            required
            placeholder="Enter your health facility or institution"
          />

          <div className="text-xs text-gray-600">
            By registering, you agree to our{' '}
            <Link href="/privacy-policy" className="font-medium text-blue-700 hover:text-blue-800">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="font-medium text-blue-700 hover:text-blue-800">
              Terms of Service
            </Link>.
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              className="py-3 px-4"
            >
              Create Account
            </Button>
          </div>
        </form>
        
        <div className="text-center text-sm text-gray-600">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-700 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}