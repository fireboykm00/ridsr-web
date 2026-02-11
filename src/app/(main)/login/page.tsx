// src/app/(main)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { useToastHelpers } from '@/components/ui/Toast';
import { Checkbox } from '@/components/ui/Checkbox';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const { error: showError, success } = useToastHelpers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!identifier.trim()) {
      showError("Please enter your email or worker ID");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      showError("Please enter your password");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        identifier: identifier.trim(),
        password,
      });

      if (result?.error) {
        // Extract error message from NextAuth response
        const errorMessage = result.error || "Invalid email/worker ID or password";
        console.error('Login error:', errorMessage);
        showError(errorMessage);
        setLoading(false);
      } else if (result?.ok) {
        success('Login successful!');
        router.push(callbackUrl);
        router.refresh();
      } else {
        showError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Login exception:', errorMessage);
      showError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <RIDSRLogo size={43} showText={true} textSize={24} textColor="#1f2937" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to RIDSR
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the Rwanda National Integrated Disease Surveillance and Response Platform
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email or Worker ID"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            placeholder="admin@ridsr.rw or ADMIN001"
          />

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <Checkbox
              id="remember-me"
              label="Remember me"
            />
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-700 hover:text-blue-800">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              className="py-3 px-4"
            >
              Sign in
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-blue-700 hover:text-blue-800">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}