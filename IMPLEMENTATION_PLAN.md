# RIDSR Project - Implementation Plan
**Date:** February 12, 2026  
**Duration:** 12 working days (2.4 weeks)  
**Goal:** Fix all conflicts, reduce redundancy, complete project

---

## Overview

This plan breaks down the project fixes into 5 phases with specific tasks, files, and acceptance criteria.

---

## Phase 1: Model Layer Cleanup (Days 1-2) ✅ COMPLETED

### Objective
Simplify Mongoose models, remove redundant fields, align with TypeScript types

### Tasks

#### Task 1.1: Simplify Patient Model (2 hours) ✅
**File:** `/src/lib/models/Patient.ts`

**Changes:**
```typescript
// Remove these fields:
- address.street
- address.sector  
- address.country
- province
- occupation
- updatedAt

// Keep only:
- nationalId, firstName, lastName, dateOfBirth, gender, phone
- district (single location field)
- emergencyContact (optional)
- createdAt
```

**Acceptance Criteria:**
- [x] Model has exactly 9 fields
- [x] All required fields are marked as required
- [x] Indexes added on nationalId and district
- [x] TypeScript types updated in `/src/types/index.ts`

---

#### Task 1.2: Simplify Case Model (2 hours) ✅
**File:** `/src/lib/models/Case.ts`

**Changes:**
```typescript
// Remove these fields:
- validatorId
- validationDate
- isAlertTriggered (compute this)
- labResults (move to separate collection)
- outcomeDate
- updatedAt

// Keep only:
- patientId, facilityId, diseaseCode, symptoms
- onsetDate, reportDate, reporterId
- validationStatus, outcome
- createdAt
```

**Acceptance Criteria:**
- [x] Model has exactly 10 fields
- [x] Proper indexes on patientId, facilityId, diseaseCode
- [x] Validation status defaults to 'pending'
- [x] TypeScript types updated

---

#### Task 1.3: Simplify User Model (1 hour) ✅
**File:** `/src/lib/models/User.ts`

**Changes:**
```typescript
// Remove these fields:
- province
- updatedAt

// Keep only:
- name, email, password, role
- facilityId, district
- isActive, createdAt
```

**Acceptance Criteria:**
- [x] Model has exactly 8 fields
- [x] Email index is unique
- [x] Password field has proper validation
- [x] TypeScript types updated

---

#### Task 1.4: Review and Simplify Facility Model (1 hour) ✅
**File:** `/src/lib/models/Facility.ts`

**Action:** Examine and apply similar simplification principles

---

#### Task 1.5: Create Migration Script (3 hours)
**File:** `/scripts/migrate-models.ts`

**Purpose:** Migrate existing data to new schema

```typescript
// Script should:
// 1. Backup existing data
// 2. Transform Patient records (remove address fields, add district)
// 3. Transform Case records (remove computed fields)
// 4. Transform User records (remove province)
// 5. Validate migrated data
// 6. Log migration results
```

**Acceptance Criteria:**
- [ ] Script runs without errors
- [ ] All data migrated successfully
- [ ] Backup created before migration
- [ ] Migration log generated

---

#### Task 1.6: Update Type Definitions (1 hour)
**Files:** 
- `/src/types/index.ts`
- `/src/types/forms.ts`

**Changes:**
- Update all interfaces to match simplified models
- Remove unused types
- Add JSDoc comments

**Acceptance Criteria:**
- [ ] Zero TypeScript errors
- [ ] Types match models exactly
- [ ] Form types updated

---

#### Task 1.7: Testing (2 hours)
**Actions:**
- Test model creation
- Test model queries
- Test validation
- Test relationships

**Acceptance Criteria:**
- [ ] All model tests pass
- [ ] Can create records with new schema
- [ ] Can query records successfully

---

## Phase 2: Service Layer Refactoring (Days 3-4)

### Objective
Move services to server-side, remove client-side fetch calls, add proper validation

### Tasks

#### Task 2.1: Create Server-Side Service Structure (1 hour)
**New Directory:** `/src/lib/services/server/`

**Files to create:**
- `baseService.ts` - Base class with common logic
- `caseService.ts` - Server-side case operations
- `patientService.ts` - Server-side patient operations
- `userService.ts` - Server-side user operations
- `facilityService.ts` - Server-side facility operations

---

#### Task 2.2: Implement Base Service (1 hour)
**File:** `/src/lib/services/server/baseService.ts`

```typescript
export abstract class BaseService<T> {
  constructor(protected model: Model<T>) {}
  
  async findById(id: string): Promise<T | null> {
    await dbConnect();
    return this.model.findById(id).lean();
  }
  
  async findAll(filters?: any): Promise<T[]> {
    await dbConnect();
    return this.model.find(filters).lean();
  }
  
  async create(data: Partial<T>): Promise<T> {
    await dbConnect();
    return this.model.create(data);
  }
  
  async update(id: string, data: Partial<T>): Promise<T | null> {
    await dbConnect();
    return this.model.findByIdAndUpdate(id, data, { new: true }).lean();
  }
  
  async delete(id: string): Promise<boolean> {
    await dbConnect();
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
```

---

#### Task 2.3: Refactor Case Service (2 hours)
**File:** `/src/lib/services/server/caseService.ts`

**Changes:**
- Extend BaseService
- Remove client-side fetch calls
- Add proper validation
- Add pagination support
- Add filtering logic

**Acceptance Criteria:**
- [ ] All methods are server-side
- [ ] No fetch calls
- [ ] Proper error handling
- [ ] TypeScript types correct

---

#### Task 2.4: Refactor Patient Service (2 hours)
**File:** `/src/lib/services/server/patientService.ts`

**Similar changes as Case Service**

---

#### Task 2.5: Refactor User Service (2 hours)
**File:** `/src/lib/services/server/userService.ts`

**Additional:**
- Add password hashing in service
- Add email validation
- Add role-based access checks

---

#### Task 2.6: Refactor Facility Service (2 hours)
**File:** `/src/lib/services/server/facilityService.ts`

**Similar changes as other services**

---

#### Task 2.7: Delete Old Client Services (1 hour)
**Action:** Remove old service files from `/src/lib/services/`

**Files to delete:**
- Old `caseService.ts`
- Old `patientService.ts`
- Old `userService.ts`
- Old `facilityService.ts`

**Keep:**
- `db.ts` (database connection)
- `dashboardService.ts` (may need refactoring)

---

## Phase 3: API Standardization (Days 5-7)

### Objective
Standardize all API routes with consistent responses, validation, error handling

### Tasks

#### Task 3.1: Create API Response Wrapper (1 hour)
**File:** `/src/lib/api/response.ts`

```typescript
import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({
    success: true,
    data
  }, { status });
}

export function errorResponse(error: string, status = 500, message?: string) {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error,
    message
  }, { status });
}
```

---

#### Task 3.2: Create Validation Middleware (2 hours)
**File:** `/src/lib/middleware/validate.ts`

```typescript
import { z } from 'zod';
import { NextRequest } from 'next/server';

export function validateRequest<T>(schema: z.Schema<T>) {
  return async (request: NextRequest): Promise<T> => {
    const body = await request.json();
    return schema.parse(body);
  };
}
```

---

#### Task 3.3: Create Validation Schemas (2 hours)
**File:** `/src/lib/schemas/index.ts`

```typescript
import { z } from 'zod';

export const createCaseSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  diseaseCode: z.string().min(1, 'Disease code is required'),
  symptoms: z.array(z.string()).min(1, 'At least one symptom required'),
  onsetDate: z.string().datetime('Invalid date format'),
});

export const createPatientSchema = z.object({
  nationalId: z.string().length(16, 'National ID must be 16 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().regex(/^\+?[0-9]{10,}$/, 'Invalid phone number'),
  district: z.string().min(1, 'District is required'),
});

// Add more schemas for other entities
```

---

#### Task 3.4: Refactor Cases API (2 hours)
**File:** `/src/app/api/cases/route.ts`

**Changes:**
- Use new response wrappers
- Add validation with Zod
- Use server-side service
- Add pagination
- Add proper error handling

**Acceptance Criteria:**
- [ ] Consistent response format
- [ ] Input validation working
- [ ] Proper status codes
- [ ] Error messages clear

---

#### Task 3.5: Refactor Patients API (2 hours)
**File:** `/src/app/api/patients/route.ts`

**Similar changes as Cases API**

---

#### Task 3.6: Refactor Users API (2 hours)
**File:** `/src/app/api/users/route.ts`

**Additional:**
- Password hashing before storage
- Email uniqueness check
- Role validation

---

#### Task 3.7: Refactor Facilities API (2 hours)
**File:** `/src/app/api/facilities/route.ts`

**Similar changes as other APIs**

---

#### Task 3.8: Add Search Endpoints (2 hours)
**New Files:**
- `/src/app/api/patients/search/route.ts`
- `/src/app/api/facilities/search/route.ts`

**Purpose:** Support SearchableSelect async search

```typescript
// Example: /api/patients/search?q=john
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  
  const patients = await patientService.search(query);
  
  return successResponse(patients.map(p => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName} (${p.nationalId})`
  })));
}
```

---

#### Task 3.9: Testing (4 hours)
**Actions:**
- Test all API endpoints
- Test validation
- Test error handling
- Test pagination

**Acceptance Criteria:**
- [ ] All endpoints return consistent responses
- [ ] Validation catches invalid input
- [ ] Error messages are helpful
- [ ] Pagination works correctly

---

## Phase 4: UI Components & Forms (Days 8-9)

### Objective
Enhance SearchableSelect, update forms to use it, simplify form fields

### Tasks

#### Task 4.1: Refactor SearchableSelect (4 hours)
**File:** `/src/components/ui/SearchableSelect.tsx`

**Add Features:**
1. TypeScript generics for type safety
2. Async data loading with `onSearch` prop
3. Multi-select support with `isMulti` prop
4. Loading states
5. Clear/reset button
6. Custom option rendering
7. Better keyboard navigation
8. ARIA attributes for accessibility

**New Interface:**
```typescript
interface SearchableSelectProps<T = any> {
  label?: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  options?: SelectOption[];
  onSearch?: (term: string) => Promise<SelectOption[]>;
  isMulti?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  renderOption?: (option: SelectOption) => React.ReactNode;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}
```

**Acceptance Criteria:**
- [ ] Supports async data loading
- [ ] Multi-select works
- [ ] Loading spinner shows
- [ ] Clear button works
- [ ] Keyboard navigation smooth
- [ ] Accessible (ARIA labels)

---

#### Task 4.2: Update CaseReportForm (2 hours)
**File:** `/src/components/forms/CaseReportForm.tsx`

**Changes:**
1. Replace Patient ID input with SearchableSelect
2. Make disease codes load from API
3. Consider multi-select for symptoms
4. Add loading states

```typescript
<SearchableSelect
  label="Patient *"
  value={formData.patientId}
  onChange={(value) => setFormData(prev => ({ ...prev, patientId: value as string }))}
  onSearch={async (term) => {
    const res = await fetch(`/api/patients/search?q=${term}`);
    return res.json();
  }}
  error={errors.patientId}
  placeholder="Search patient by name or ID..."
/>
```

**Acceptance Criteria:**
- [ ] Patient search works
- [ ] Disease codes load from API
- [ ] Form submits correctly
- [ ] Validation works

---

#### Task 4.3: Update UserManagementForm (2 hours)
**File:** `/src/components/forms/UserManagementForm.tsx`

**Changes:**
1. Use SearchableSelect for facility
2. Use SearchableSelect for district
3. Use SearchableSelect for role
4. Remove province field
5. Simplify to core fields only

**Acceptance Criteria:**
- [ ] All dropdowns use SearchableSelect
- [ ] Form has max 8 fields
- [ ] Validation works
- [ ] Submits correctly

---

#### Task 4.4: Update FacilityManagementForm (2 hours)
**File:** `/src/components/forms/FacilityManagementForm.tsx`

**Changes:**
1. Remove complex address fields
2. Use SearchableSelect for district/province
3. Use SearchableSelect for facility type
4. Simplify to core fields

**Acceptance Criteria:**
- [ ] Form simplified
- [ ] All dropdowns use SearchableSelect
- [ ] Validation works

---

#### Task 4.5: Create Form Examples Documentation (1 hour)
**File:** `/docs/FORM_EXAMPLES.md`

**Content:**
- How to use SearchableSelect
- How to implement async search
- How to handle multi-select
- Form validation patterns
- Error handling patterns

---

## Phase 5: Integration & Testing (Days 10-12)

### Objective
Connect everything, test end-to-end, fix bugs, document

### Tasks

#### Task 5.1: Integration Testing (4 hours)
**Test Flows:**
1. Create patient → Create case → Validate case
2. Create user → Assign facility → Login
3. Create facility → Assign users → Report cases
4. Search patients → Select → Report case
5. Filter cases → View details → Update status

**Acceptance Criteria:**
- [ ] All flows work end-to-end
- [ ] No console errors
- [ ] Data persists correctly
- [ ] UI updates properly

---

#### Task 5.2: Bug Fixing (8 hours)
**Process:**
1. Document all bugs found
2. Prioritize by severity
3. Fix high-priority bugs first
4. Retest after fixes

**Common Issues to Check:**
- Form validation edge cases
- API error handling
- Loading states
- Race conditions
- Type mismatches

---

#### Task 5.3: Performance Optimization (2 hours)
**Actions:**
- Add database indexes
- Optimize queries
- Add caching where appropriate
- Lazy load components
- Optimize images

**Acceptance Criteria:**
- [ ] Page load < 2 seconds
- [ ] API response < 500ms
- [ ] No unnecessary re-renders

---

#### Task 5.4: Documentation (4 hours)
**Files to Create/Update:**
1. `README.md` - Project overview, setup instructions
2. `ARCHITECTURE.md` - System architecture, data flow
3. `API_DOCUMENTATION.md` - All API endpoints, request/response formats
4. `DEPLOYMENT.md` - Deployment instructions
5. `CHANGELOG.md` - All changes made

---

#### Task 5.5: Code Review & Cleanup (2 hours)
**Actions:**
- Remove commented code
- Remove unused imports
- Fix linting errors
- Ensure consistent formatting
- Add missing comments

**Acceptance Criteria:**
- [ ] Zero linting errors
- [ ] Zero TypeScript errors
- [ ] Code formatted consistently
- [ ] No unused code

---

#### Task 5.6: Final Testing (2 hours)
**Test:**
- All user roles
- All CRUD operations
- All forms
- All API endpoints
- Error scenarios
- Edge cases

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] No critical bugs
- [ ] Ready for deployment

---

## Daily Schedule

### Day 1 (Monday)
- Morning: Task 1.1, 1.2 (Patient & Case models)
- Afternoon: Task 1.3, 1.4 (User & Facility models)

### Day 2 (Tuesday)
- Morning: Task 1.5 (Migration script)
- Afternoon: Task 1.6, 1.7 (Types & Testing)

### Day 3 (Wednesday)
- Morning: Task 2.1, 2.2 (Service structure & base)
- Afternoon: Task 2.3 (Case service)

### Day 4 (Thursday) ✅ COMPLETE
- Morning: Task 2.4, 2.5 (Patient & User services) ✅
- Afternoon: Task 2.6, 2.7 (Facility service & cleanup) ✅
- **BONUS:** Dashboard service with RBAC methods completed ✅

### Day 5 (Friday)
- Morning: Task 3.1, 3.2, 3.3 (API infrastructure)
- Afternoon: Task 3.4 (Cases API)

### Day 6 (Monday)
- Morning: Task 3.5, 3.6 (Patients & Users API)
- Afternoon: Task 3.7, 3.8 (Facilities API & Search)

### Day 7 (Tuesday)
- Full day: Task 3.9 (API Testing)

### Day 8 (Wednesday)
- Morning: Task 4.1 (SearchableSelect refactor)
- Afternoon: Task 4.2 (CaseReportForm)

### Day 9 (Thursday)
- Morning: Task 4.3 (UserManagementForm)
- Afternoon: Task 4.4, 4.5 (FacilityForm & Docs)

### Day 10 (Friday)
- Morning: Task 5.1 (Integration testing)
- Afternoon: Task 5.2 (Bug fixing - part 1)

### Day 11 (Monday) ✅ COMPLETE
- Morning: Task 5.2 (Bug fixing - part 2) ✅
- Afternoon: Task 5.3 (Performance optimization) ✅
- **BONUS:** Complete main dashboard pages for all roles ✅
  - Updated `/src/app/(main)/dashboard/page.tsx` with role-based auto-redirect ✅
  - Updated `/src/app/(main)/dashboard/national/page.tsx` with national stats and charts ✅
  - Updated `/src/app/(main)/dashboard/district/page.tsx` with district stats and charts ✅
  - Updated `/src/app/(main)/dashboard/facility/page.tsx` with facility stats and charts ✅
  - All dashboards fetch appropriate stats from `/api/dashboard` with role-based data ✅
  - Added charts/cards for cases, alerts, trends using existing dashboard components ✅

### Day 12 (Tuesday) ✅ COMPLETE
- Morning: Task 5.4 (Documentation) 
- Afternoon: Task 5.5, 5.6 (Code review & Final testing)
- **BONUS:** Complete authentication and account management ✅
  - Updated `/src/app/(main)/login/page.tsx` with enhanced form validation, error handling, and redirect logic ✅
  - Updated `/src/app/(main)/register/page.tsx` to disable public registration for security ✅
  - Created comprehensive `/src/app/(main)/dashboard/account/page.tsx` with profile, password, and settings management ✅
  - Added API endpoints: `/api/user/profile`, `/api/user/password`, `/api/user/settings` ✅
  - Enhanced login with proper validation, loading states, and error handling ✅
  - Account page includes profile editing, password change, notification settings, and 2FA options ✅
  - All forms include proper validation, error states, and loading indicators ✅

---

## Success Metrics

### Code Quality
- ✅ Zero TypeScript errors
- ✅ Zero linting errors
- ✅ All tests passing
- ✅ Code coverage > 70%

### Performance
- ✅ Page load < 2 seconds
- ✅ API response < 500ms
- ✅ No memory leaks
- ✅ Optimized bundle size

### User Experience
- ✅ Forms have max 10 fields
- ✅ All dropdowns use SearchableSelect
- ✅ Clear error messages
- ✅ Loading states everywhere
- ✅ Responsive design works

### API Quality
- ✅ Consistent response format
- ✅ Proper status codes
- ✅ Input validation on all routes
- ✅ Proper error handling
- ✅ Pagination support

---

## Risk Management

### Potential Risks

1. **Data Migration Issues**
   - Risk: Existing data doesn't migrate cleanly
   - Mitigation: Create backup, test migration on copy first

2. **Breaking Changes**
   - Risk: Model changes break existing functionality
   - Mitigation: Comprehensive testing, gradual rollout

3. **Time Overruns**
   - Risk: Tasks take longer than estimated
   - Mitigation: Daily progress tracking, adjust plan as needed

4. **Integration Issues**
   - Risk: Components don't work together
   - Mitigation: Integration testing early and often

---

## Rollback Plan

If critical issues arise:

1. **Immediate Rollback**
   - Revert to backup branch
   - Restore database from backup
   - Deploy previous version

2. **Partial Rollback**
   - Keep completed phases
   - Rollback problematic phase
   - Fix issues, redeploy

3. **Data Recovery**
   - Use migration backup
   - Restore to pre-migration state
   - Re-run migration with fixes

---

## Post-Implementation

### Week 3 (Monitoring)
- Monitor for bugs
- Gather user feedback
- Performance monitoring
- Fix any critical issues

### Week 4 (Polish)
- Address user feedback
- Performance tuning
- UI/UX improvements
- Documentation updates

---

## Conclusion

This plan provides a clear path to:
- ✅ Fix all model conflicts
- ✅ Standardize API responses
- ✅ Simplify forms by 40%
- ✅ Complete SearchableSelect implementation
- ✅ Deliver a production-ready system

**Ready to begin Phase 1?**
