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
    if (!validateForm()) return;
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
        const session = await getSession();
        if (session?.user) {
          success("Login successful!");
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
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Login exception:", errorMessage);
      showError(errorMessage);
      setLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Pattern background - fixed */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/rwanda-pattern.svg')" }}
      />
      <div className="fixed inset-0 bg-primary/[0.03]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 py-12">
        <div className="bg-background/90 backdrop-blur-sm border border-border rounded-md p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold text-foreground">RIDSR</span>
            </Link>
            <h2 className="text-2xl font-bold text-foreground">Sign In</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Access the surveillance platform
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email or Worker ID"
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
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
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
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
                onChange={(checked) => setRememberMe(checked)}
                disabled={loading}
              />
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:text-primary/80"
                tabIndex={loading ? -1 : 0}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              disabled={loading}
              className="py-3"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-md">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Demo Credentials
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-mono text-foreground bg-background px-2 py-0.5 rounded border border-border text-xs">
                  admin@ridsr.rw
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Password</span>
                <span className="font-mono text-foreground bg-background px-2 py-0.5 rounded border border-border text-xs">
                  Hello123
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
