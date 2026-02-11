// src/app/(main)/auth/error/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AuthErrorPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get error from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      switch (errorParam) {
        case 'CredentialsSignin':
          setError('Invalid email or password. Please try again.');
          break;
        case 'Verification':
          setError('Verification link expired or invalid. Please try again.');
          break;
        case 'OAuthAccountNotLinked':
          setError('Account not linked. Please sign in with the same provider you used originally.');
          break;
        default:
          setError('An authentication error occurred. Please try again.');
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-center text-gray-600">
              {error || 'An unexpected error occurred during authentication.'}
            </p>
          </div>

          <div className="mt-8">
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push('/login')}
            >
              Return to Login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}