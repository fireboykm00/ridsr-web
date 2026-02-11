# RIDSR Architecture After Cleanup

## Type System (Single Source of Truth)

```
src/types/index.ts
├── User Types
│   ├── User
│   ├── UserRole (enum)
│   ├── UserFormData
│   ├── CreateUserInput
│   └── UpdateUserInput
├── Facility Types
│   ├── Facility
│   ├── FacilityType (enum)
│   ├── FacilityFormData
│   ├── CreateFacilityInput
│   └── UpdateFacilityInput
├── Case Types
│   ├── Case
│   ├── CaseStatus (enum)
│   ├── CaseReportFormData
│   └── ValidationStatus (enum)
├── Patient Types
│   ├── Patient
│   └── Gender (enum)
├── Lab Types
│   ├── LabResult
│   └── LabResultInterpretation (enum)
├── Alert Types
│   ├── Alert
│   ├── AlertSeverity (enum)
│   └── AlertStatus (enum)
├── Report Types
│   ├── Report
│   ├── ReportType (enum)
│   ├── ReportStatus (enum)
│   ├── ReportFilters
│   └── DashboardStats
├── Bulletin Types
│   ├── Bulletin
│   ├── BulletinType (enum)
│   └── BulletinStatus (enum)
├── Threshold Types
│   ├── ThresholdRule
│   └── ValidationQueueItem
├── Permission Types
│   ├── Permission
│   └── RolePermissions
├── Session Types
│   └── ExtendedSession
├── API Types
│   └── ApiResponse<T>
└── Geographic Types
    ├── RwandaProvince
    └── RwandaDistrict
```

## Service Layer (API Wrappers)

```
src/lib/services/
├── user-service.ts
│   ├── getCurrentUser()
│   ├── isAdmin()
│   ├── hasRole()
│   ├── getUserById()
│   ├── getAllUsers()
│   ├── getUsersByRole()
│   ├── getUsersByFacility()
│   ├── getUsersByDistrict()
│   ├── createUser()
│   ├── updateUser()
│   └── deleteUser()
├── facility-service.ts
│   ├── getAllFacilities()
│   ├── getFacilitiesByDistrict()
│   ├── getFacilityById()
│   ├── createFacility()
│   ├── updateFacility()
│   ├── deleteFacility()
│   ├── getFacilitiesForUser()
│   ├── filterFacilitiesByAccess()
│   └── canAccessFacility()
├── case.service.ts
│   ├── filterCasesByAccess()
│   ├── canAccessCase()
│   └── prepareNewCase()
├── patient.service.ts
│   ├── filterPatientsByAccess()
│   ├── canAccessPatient()
│   └── prepareNewPatient()
├── dashboard.service.ts
│   └── getDashboardData()
├── threshold-engine.service.ts
│   ├── getAllThresholdRules()
│   ├── createThresholdRule()
│   ├── updateThresholdRule()
│   ├── evaluateThreshold()
│   └── generateAlert()
└── db.ts (utility)
```

## API Layer (Database Implementation)

```
src/app/api/
├── users/
│   ├── route.ts (GET/POST)
│   ├── [id]/route.ts (GET/PUT/DELETE)
│   └── search/route.ts (GET)
├── facilities/
│   ├── route.ts (GET/POST)
│   └── [id]/route.ts (GET/PUT/DELETE)
├── cases/
│   ├── route.ts (GET/POST)
│   ├── [id]/route.ts (GET/PUT/DELETE)
│   └── validate/[id]/route.ts (POST)
├── alerts/
│   ├── route.ts (GET/POST)
│   └── [id]/route.ts (GET/PUT/DELETE)
├── reports/
│   ├── route.ts (GET/POST)
│   └── generate/route.ts (POST)
├── validation/
│   └── queue/route.ts (GET)
└── auth/
    └── [...nextauth]/route.ts
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Components/Pages                        │
│  (src/components/*, src/features/*, src/app/(main)/*)       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ (import types from @/types)
┌─────────────────────────────────────────────────────────────┐
│                    Type System                               │
│              (src/types/index.ts)                            │
│         Single Source of Truth for All Types                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ (use types)
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│            (src/lib/services/*.ts)                           │
│  - Authentication checks                                     │
│  - Authorization checks                                      │
│  - API call wrappers                                         │
│  - Access control logic                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ (fetch)
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                 │
│            (src/app/api/*/route.ts)                          │
│  - Request validation                                        │
│  - Authentication middleware                                 │
│  - Database operations (TODO)                                │
│  - Response formatting                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ (query/mutation)
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
│              (To be implemented)                             │
│  - Prisma ORM / Database Client                              │
│  - Data persistence                                          │
│  - Query optimization                                        │
└─────────────────────────────────────────────────────────────┘
```

## Key Principles

### 1. Single Source of Truth
- All types defined in `src/types/index.ts`
- No duplicate type definitions
- Consistent across entire application

### 2. Separation of Concerns
- **Types**: Data structure definitions
- **Services**: Business logic and API calls
- **API Routes**: Request handling and database operations
- **Components**: UI rendering and user interaction

### 3. Authorization & Access Control
- Implemented at service layer
- Enforced at API layer
- Role-based access control (RBAC)
- Facility-based access control

### 4. Minimal Implementation
- Services are thin wrappers around API calls
- No business logic in services
- No mock data anywhere
- All real implementation in API routes

### 5. Type Safety
- Full TypeScript support
- Centralized type definitions
- Consistent type usage
- No `any` types

## Import Patterns

### In Components
```typescript
import { User, Case, Facility } from '@/types';
import { userService } from '@/lib/services/user-service';
```

### In Services
```typescript
import { User, CreateUserInput, UpdateUserInput, ROLES } from '@/types';
import { auth } from '@/lib/auth';
```

### In API Routes
```typescript
import { User, CreateUserInput, ROLES } from '@/types';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
```

## Database Implementation Template

Each API route has a TODO comment showing where to implement database operations:

```typescript
// TODO: Implement real database query
// const users = await db.user.findMany({
//   where: { role: 'admin' },
// });
```

Replace with actual database client (Prisma, Drizzle, etc.):

```typescript
// Real implementation
const users = await db.user.findMany({
  where: { role: 'admin' },
});
```

## Benefits of This Architecture

1. **Maintainability**: Easy to locate and update types
2. **Scalability**: Clear separation of concerns
3. **Type Safety**: Centralized type definitions prevent mismatches
4. **Consistency**: All services follow same pattern
5. **Testability**: Easy to mock services for testing
6. **Performance**: Thin service layer with minimal overhead
7. **Security**: Authorization checks at multiple layers

---

**Architecture is now clean, organized, and ready for database implementation!** ✨
