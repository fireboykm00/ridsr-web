'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/dashboard' }];

  const breadcrumbMap: Record<string, string> = {
    'national': 'National Dashboard',
    'district': 'District Dashboard',
    'facility': 'Facility Dashboard',
    'cases': 'Cases',
    'patients': 'Patients',
    'users': 'Users',
    'facilities': 'Facilities',
    'reports': 'Reports',
    'alerts': 'Alerts',
    'validation': 'Validation',
    'settings': 'Settings',
    'account': 'Account',
    'admin': 'Administration',
  };

  let currentPath = '';
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    if (segment.startsWith('[')) continue;
    currentPath += `/${segment}`;
    const label = breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <span className="text-muted-foreground/60">/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-primary hover:text-primary/80">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
