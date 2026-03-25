// src/app/(main)/register/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RIDSRLogo from '@/components/ui/RIDSRLogo';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <RIDSRLogo size={43} showText={true} textSize={24} textColor="#111827" />
          <h2 className="mt-6 text-2xl font-bold text-foreground">
            Registration Disabled
          </h2>
          <div className="mt-6 p-6 bg-primary/5 border border-primary/20 rounded-md">
            <p className="text-sm text-foreground mb-4">
              Public registration is currently disabled for security reasons. 
              New accounts must be created by system administrators.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              If you need access to the RIDSR platform, please contact your:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
              <li>Health facility administrator</li>
              <li>District health officer</li>
              <li>System administrator</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              You will be redirected to the login page in a few seconds.
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            onClick={() => router.push('/login')}
            fullWidth
            className="py-3 px-4"
          >
            Go to Login
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
