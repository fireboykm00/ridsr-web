# Phase 2: Quick Reference Guide

## What Changed?

### 1. Types System
**Location**: `src/types/index.ts`

**New Types Added**:
```typescript
DashboardChartData
DashboardMetrics
NavItem
ApiPaginatedResponse<T>
ApiErrorResponse
ChartDataPoint
PieChartData
LineChartData
BarChartData
MapRegionData
RwandaDistrictType
```

**Usage**:
```typescript
import { DashboardMetrics, NavItem } from '@/types';
```

### 2. Dashboard Home Page
**Location**: `src/app/(main)/dashboard/page.tsx`

**Changes**:
- ❌ Removed hardcoded mock data
- ✅ Added API data fetching
- ✅ Added loading states
- ✅ Added error handling
- ✅ Type-safe components

**How It Works**:
```typescript
const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

useEffect(() => {
  getDashboardMetrics().then(setMetrics);
}, [session?.user]);
```

### 3. Sidebar Navigation
**Location**: `src/components/layout/Sidebar.tsx`

**Changes**:
- ✅ Fixed responsive design
- ✅ Added mobile hamburger menu
- ✅ Fixed navigation URLs
- ✅ Removed undefined roles
- ✅ Added proper TypeScript types

**Navigation URLs** (Updated):
```
/dashboard/report-case
/dashboard/cases
/dashboard/patients
/dashboard/validation
/dashboard/alerts
/dashboard/reports
/dashboard/users
/dashboard/facilities
/dashboard/settings
```

### 4. API Routes
**Location**: `src/app/api/dashboard/`

**New Endpoints**:
- `GET /api/dashboard/metrics` - Dashboard metrics
- `GET /api/dashboard/charts` - Chart data

**Response Types**:
```typescript
// Metrics
{
  totalCases: number;
  activeOutbreaks: number;
  reportsThisWeek: number;
  facilitiesOnline: number;
}

// Charts
{
  diseaseDistribution: DashboardChartData[];
  weeklyTrends: DashboardChartData[];
  regionCases: DashboardChartData[];
  geographicSpread: DashboardChartData[];
}
```

## How to Use

### Import Types
```typescript
import {
  DashboardMetrics,
  NavItem,
  DashboardChartData
} from '@/types';
```

### Fetch Dashboard Data
```typescript
import { getDashboardMetrics, getDashboardCharts } from '@/lib/services/dashboard.service';

const metrics = await getDashboardMetrics();
const charts = await getDashboardCharts();
```

### Create Navigation Items
```typescript
const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon />,
    roles: [ROLES.ADMIN, ROLES.HEALTH_WORKER],
    badge: 5,
    disabled: false,
  },
];
```

## Common Tasks

### Add New Navigation Item
1. Update `src/components/layout/Sidebar.tsx`
2. Add to `navItems` array
3. Use `NavItem` type from `@/types`
4. Specify roles that can access it

### Add New Dashboard Chart
1. Add chart data to API response in `src/app/api/dashboard/charts/route.ts`
2. Add type to `DashboardChartData[]` in response
3. Render in dashboard using chart component
4. Use proper TypeScript types

### Implement Database Query
1. Find TODO comment in API route
2. Replace with actual database query
3. Ensure response matches type definition
4. Add error handling

## File Structure

```
src/
├── types/
│   └── index.ts (UPDATED - new types added)
├── lib/
│   └── services/
│       └── dashboard.service.ts (UPDATED - new functions)
├── app/
│   ├── api/
│   │   └── dashboard/
│   │       ├── metrics/
│   │       │   └── route.ts (NEW)
│   │       └── charts/
│   │           └── route.ts (NEW)
│   └── (main)/
│       └── dashboard/
│           └── page.tsx (REWRITTEN)
└── components/
    └── layout/
        └── Sidebar.tsx (REWRITTEN)
```

## Validation Checklist

Before committing changes:

- [ ] All types imported from `@/types`
- [ ] No hardcoded mock data
- [ ] No unused variables
- [ ] No TypeScript errors
- [ ] API routes have TODO comments for DB implementation
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Mobile responsive

## Common Errors & Solutions

### Error: "Cannot find module '@/types'"
**Solution**: Check import path, should be `@/types` not `./types`

### Error: "ROLES.FACILITY_ADMIN is not defined"
**Solution**: Use valid roles only:
- ROLES.ADMIN
- ROLES.NATIONAL_OFFICER
- ROLES.DISTRICT_OFFICER
- ROLES.HEALTH_WORKER
- ROLES.LAB_TECHNICIAN

### Error: "Type 'undefined' is not assignable to type 'DashboardMetrics'"
**Solution**: Check null/undefined handling:
```typescript
if (!metrics) return <EmptyState />;
```

### Error: "Property 'xyz' does not exist on type 'NavItem'"
**Solution**: Check NavItem interface in `@/types`:
```typescript
interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: number;
  disabled?: boolean;
}
```

## Performance Tips

1. **Use Parallel Requests**:
```typescript
const [metrics, charts] = await Promise.all([
  getDashboardMetrics(),
  getDashboardCharts(),
]);
```

2. **Implement Caching**:
```typescript
// Use React Query or SWR
const { data: metrics } = useQuery('metrics', getDashboardMetrics);
```

3. **Lazy Load Charts**:
```typescript
{charts && charts.length > 0 && <Chart data={charts} />}
```

## Mobile Responsiveness

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Sidebar on Mobile
- Hamburger menu visible
- Slide-in animation
- Overlay to close
- Touch-friendly

## Next Phase Tasks

### Phase 2.2: Component Types
- [ ] Update dashboard components
- [ ] Update form components
- [ ] Remove local type definitions

### Phase 2.3: Admin Integration
- [ ] Move admin to main dashboard
- [ ] Create admin pages
- [ ] Add admin navigation

### Phase 2.4: Database
- [ ] Implement database queries
- [ ] Add caching
- [ ] Optimize performance

## Resources

- **Type Definitions**: `src/types/index.ts`
- **Dashboard Service**: `src/lib/services/dashboard.service.ts`
- **API Routes**: `src/app/api/dashboard/`
- **Components**: `src/components/layout/Sidebar.tsx`
- **Analysis**: `PHASE_2_DEEP_ANALYSIS.md`
- **Summary**: `PHASE_2_IMPLEMENTATION_SUMMARY.md`

## Support

For questions or issues:
1. Check `PHASE_2_DEEP_ANALYSIS.md` for detailed explanation
2. Review `PHASE_2_IMPLEMENTATION_SUMMARY.md` for changes
3. Check type definitions in `src/types/index.ts`
4. Review API routes for implementation details

---

**Last Updated**: 2026-02-11
**Version**: 1.0
**Status**: Phase 2.1 Complete