// src/app/(main)/dashboard/layout.tsx
import { ReactNode } from 'react';
import DashboardClient from '@/components/layout/DashboardClient';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardClient>{children}</DashboardClient>;
}