// src/app/(main)/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useToastHelpers } from "@/components/ui/Toast";
import { Checkbox } from "@/components/ui/Checkbox";
import RIDSRLogo from "@/components/ui/RIDSRLogo";
import { getAuthErrorMessage } from "@/lib/auth/error-messages";

interface FormErrors {
  identifier?: string;
  password?: string;
}

export default function LoginPage() {
  const { status } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const { error: showError, success } = useToastHelpers();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Show error from URL params (e.g., from middleware redirect)
  useEffect(() => {
    if (error) {
      showError(getAuthErrorMessage(error, code));
    }
  }, [error, code, showError]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = "Email or Worker ID is required";
    } else if (
      identifier.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
    ) {
      newErrors.identifier = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: identifier.trim(),
        password,
      });

      if (result?.error) {
        showError(getAuthErrorMessage(result.error, result.code));
        setLoading(false);
      } else if (result?.ok) {
        // Get updated session to ensure user data is available
        const session = await getSession();
        if (session?.user) {
          success("Login successful!");
          // Small delay to show success message
          setTimeout(() => {
            router.push(callbackUrl);
            router.refresh();
          }, 500);
        } else {
          showError("Session creation failed. Please try again.");
          setLoading(false);
        }
      } else {
        showError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Login exception:", errorMessage);
      showError(errorMessage);
      setLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <RIDSRLogo
            size={43}
            showText={true}
            textSize={24}
            textColor="#1f2937"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to RIDSR
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the Rwanda National Integrated Disease Surveillance and
            Response Platform
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email or Worker ID"
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errors.identifier) {
                setErrors((prev) => ({ ...prev, identifier: undefined }));
              }
            }}
            error={errors.identifier}
            required
            autoComplete="username"
            placeholder="admin@ridsr.rw or ADMIN001"
            disabled={loading}
          />

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            error={errors.password}
            required
            autoComplete="current-password"
            disabled={loading}
          />

          <div className="flex items-center justify-between">
            <Checkbox
              id="remember-me"
              label="Remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-blue-700 hover:text-blue-800 focus:outline-none focus:underline"
                tabIndex={loading ? -1 : 0}
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              disabled={loading}
              className="py-3 px-4"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Demo Credentials
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-mono text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-100">
                admin@ridsr.rw
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Password</span>
              <span className="font-mono text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-100">
                Hello123
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-700 hover:text-blue-800"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
