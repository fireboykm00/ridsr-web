# Authentication System Analysis & Issues Report

## Current State Overview

### Files Analyzed
1. `/src/lib/auth.ts` - NextAuth configuration with mock credentials
2. `/src/lib/utils/auth.ts` - Basic role checking utilities
3. `/src/lib/utils/enhanced-auth.ts` - Advanced auth with permissions
4. `/src/lib/middleware/route-guard.ts` - Route access control
5. `/src/lib/utils/access-control.ts` - Access control utilities
6. `/src/app/(main)/login/page.tsx` - Login form
7. `/src/types/next-auth.d.ts` - NextAuth type definitions

---

## Issues Identified

### 1. ❌ DUPLICATE FUNCTIONS (Code Redundancy)
**Severity**: HIGH

Multiple files define the same functions:
- `isAdmin()` - defined in 3 files (auth.ts, enhanced-auth.ts, access-control.ts)
- `isHealthWorker()` - defined in 2 files (auth.ts, enhanced-auth.ts)
- `requireRole()` - defined in 2 files (auth.ts, enhanced-auth.ts)
- `hasAnyRole()` - defined in 2 files (auth.ts, enhanced-auth.ts)
- `canAccessFacility()` - defined in 2 files (enhanced-auth.ts, access-control.ts)
- `canAccessDistrict()` - defined in 2 files (enhanced-auth.ts, access-control.ts)

**Impact**: Maintenance nightmare, inconsistent implementations, confusion about which to use

---

### 2. ❌ MOCK DATA IN PRODUCTION CODE
**Severity**: CRITICAL

`/src/lib/auth.ts` contains hardcoded mock credentials:
```
- ADMIN001 / admin123
- HW* / health123
- DT* / health123
- LT* / health123
- NO* / health123
```

**Impact**: Security risk, not production-ready

---

### 3. ❌ LOGIN FORM MISMATCH
**Severity**: HIGH

Login form uses `email` field but auth.ts expects `workerId`:
- Form sends: `{ email, password }`
- Auth expects: `{ workerId, password }`

**Impact**: Login will fail - credentials never match

---

### 4. ❌ INCONSISTENT PERMISSION SYSTEMS
**Severity**: MEDIUM

Two different permission approaches:
- `enhanced-auth.ts`: Uses PERMISSIONS object with granular permissions
- `access-control.ts`: Uses ROLE_HIERARCHY with role-based access

**Impact**: Unclear which system to use, potential conflicts

---

### 5. ❌ UNUSED/REDUNDANT FILES
**Severity**: MEDIUM

- `route-guard.ts`: Defines `getRedirectPath()` and `hasRouteAccess()` - not used anywhere
- `access-control.ts`: Duplicates functions from enhanced-auth.ts

**Impact**: Code bloat, maintenance burden

---

### 6. ❌ INCOMPLETE IMPLEMENTATIONS
**Severity**: MEDIUM

`enhanced-auth.ts`:
- `getAccessibleFacilities()` - returns empty array with TODO
- `getEnhancedUserProfile()` - creates new User object instead of fetching from DB

**Impact**: Features don't work as intended

---

### 7. ❌ TYPE INCONSISTENCIES
**Severity**: MEDIUM

Session type defines `district` and `province` as required but they're optional in User type:
```typescript
// next-auth.d.ts
Session.user: {
  district: RWANDA_DISTRICTS;  // Required
  province: RWANDA_PROVINCES;  // Required
}

// But User type has them optional
User: {
  district?: RwandaDistrictType;
  province?: RwandaProvinceType;
}
```

**Impact**: Type mismatches, potential runtime errors

---

### 8. ❌ NO SEPARATION OF CONCERNS
**Severity**: MEDIUM

Mock data mixed with production auth logic in same file.

**Impact**: Hard to test, hard to switch to real auth

---

## Recommended Solution

### Phase 1: Consolidate Auth Files
1. Keep only `/src/lib/auth.ts` for NextAuth config
2. Create `/src/lib/auth-mock.ts` for mock credentials (development only)
3. Merge enhanced-auth.ts into a single `/src/lib/auth-utils.ts`
4. Delete redundant files: route-guard.ts, access-control.ts, utils/auth.ts

### Phase 2: Fix Login Form
- Update form to accept `workerId` OR `email`
- Update auth.ts to handle both

### Phase 3: Consolidate Permissions
- Use enhanced-auth.ts PERMISSIONS system as single source of truth
- Remove ROLE_HIERARCHY from access-control.ts

### Phase 4: Fix Type Consistency
- Make district/province optional in Session type
- Or provide defaults

---

## Files to Create/Modify

### Create:
- `/src/lib/auth-mock.ts` - Mock credentials for development

### Modify:
- `/src/lib/auth.ts` - Remove mock data, import from auth-mock.ts
- `/src/lib/utils/enhanced-auth.ts` - Rename to auth-utils.ts, keep as single source
- `/src/app/(main)/login/page.tsx` - Update to use workerId

### Delete:
- `/src/lib/utils/auth.ts`
- `/src/lib/middleware/route-guard.ts`
- `/src/lib/utils/access-control.ts`

---

## Summary

**Current State**: 
- 5 auth-related files with massive duplication
- Mock data in production code
- Login form doesn't match auth expectations
- Multiple permission systems
- Type inconsistencies

**After Fix**:
- 2 auth files (auth.ts + auth-mock.ts)
- 1 auth-utils.ts with all utilities
- Clean separation of concerns
- Single permission system
- Type consistency
- Production-ready
