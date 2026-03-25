// src/app/(main)/dashboard/report-case/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CaseReportForm from "@/components/forms/CaseReportForm";
import { USER_ROLES } from "@/types";

export default function ReportCasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You must be signed in to view this page
          </p>
          <a
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors inline-block"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  // Check if user has permission to report cases
  const canReportCases = [
    USER_ROLES.HEALTH_WORKER,
    USER_ROLES.LAB_TECHNICIAN,
    USER_ROLES.DISTRICT_OFFICER,
    USER_ROLES.ADMIN,
    USER_ROLES.NATIONAL_OFFICER
  ].includes(session.user?.role as any);

  if (!canReportCases) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You don&apos;t have permission to report cases. Only health workers, lab technicians, district officers, and administrators can report cases.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Case Reporting Form
          </h1>
          <p className="text-muted-foreground">
            Report suspected or confirmed cases of epidemic-prone diseases
          </p>
        </div>

        <CaseReportForm
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
