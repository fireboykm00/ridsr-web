# RIDSR Project - File-by-File Detailed Analysis
**Date:** February 12, 2026  
**Purpose:** Identify specific issues in each file for targeted fixes

---

## Models Layer (`/src/lib/models/`)

### ✅ Patient.ts - NEEDS SIMPLIFICATION
**Current State:** 15 fields, overly complex address structure  
**Issues:**
1. ❌ Full address object (street, sector, district, province, country) - too detailed
2. ❌ Province field redundant (can be derived from district)
3. ❌ Occupation field not critical for MVP
4. ❌ Both createdAt and updatedAt (only need createdAt)

**Recommended Changes:**
```typescript
// SIMPLIFIED VERSION
export interface IPatient extends Document {
  nationalId: string;           // ✅ Keep - unique identifier
  firstName: string;             // ✅ Keep
  lastName: string;              // ✅ Keep
  dateOfBirth: Date;            // ✅ Keep
  gender: Gender;               // ✅ Keep
  phone: string;                // ✅ Keep
  district: RwandaDistrictType; // ✅ Keep - single location field
  emergencyContact?: {          // ✅ Keep - important
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;              // ✅ Keep
  // REMOVED: province, address.street, address.sector, occupation, updatedAt
}
```

**Impact:** Reduces from 15 to 9 fields (40% reduction)

---

### ✅ Case.ts - NEEDS CLEANUP
**Current State:** 16 fields, computed fields stored in DB  
**Issues:**
1. ❌ `isAlertTriggered` - should be computed, not stored
2. ❌ `validatorId` and `validationDate` - redundant with validationStatus
3. ❌ `outcomeDate` - not critical for MVP
4. ❌ `labResults` as string array - should be separate collection
5. ❌ `updatedAt` - not needed

**Recommended Changes:**
```typescript
// SIMPLIFIED VERSION
export interface ICase extends Document {
  patientId: mongoose.Types.ObjectId;    // ✅ Keep
  facilityId: mongoose.Types.ObjectId;   // ✅ Keep
  diseaseCode: string;                   // ✅ Keep
  symptoms: string[];                    // ✅ Keep
  onsetDate: Date;                       // ✅ Keep
  reportDate: Date;                      // ✅ Keep
  reporterId: mongoose.Types.ObjectId;   // ✅ Keep
  validationStatus: ValidationStatus;    // ✅ Keep
  outcome?: OutcomeStatus;               // ✅ Keep
  createdAt: Date;                       // ✅ Keep
  // REMOVED: validatorId, validationDate, isAlertTriggered, labResults, outcomeDate, updatedAt
}
```

**Impact:** Reduces from 16 to 10 fields (37.5% reduction)

---

### ✅ User.ts - MINOR CLEANUP
**Current State:** 10 fields, mostly good  
**Issues:**
1. ❌ Province field redundant (derive from district or facility)
2. ❌ `updatedAt` - not needed

**Recommended Changes:**
```typescript
// SIMPLIFIED VERSION
export interface IUser extends Document {
  name: string;                          // ✅ Keep
  email: string;                         // ✅ Keep
  password: string;                      // ✅ Keep
  role: UserRole;                        // ✅ Keep
  facilityId?: mongoose.Types.ObjectId;  // ✅ Keep
  district?: RwandaDistrictType;         // ✅ Keep
  isActive: boolean;                     // ✅ Keep
  createdAt: Date;                       // ✅ Keep
  // REMOVED: province, updatedAt
}
```

**Impact:** Reduces from 10 to 8 fields (20% reduction)

---

### ✅ Facility.ts - NEEDS REVIEW
**Status:** Not examined yet, but likely has similar address complexity

**Expected Issues:**
- Full address object
- Redundant province/district fields
- Unnecessary timestamps

---

### ✅ Alert.ts - NEEDS REVIEW
**Status:** Not examined yet

**Expected Issues:**
- Possibly too many status fields
- Redundant location data

---

## Services Layer (`/src/lib/services/`)

### ❌ caseService.ts - MAJOR ISSUES
**Current State:** Client-side service making fetch calls  
**Issues:**
1. ❌ **Wrong Architecture** - Service should be server-side, not client-side
2. ❌ Mixing auth logic with data fetching
3. ❌ `prepareNewCase` creates fake IDs (`case_${Date.now()}`)
4. ❌ No validation before API calls
5. ❌ Inconsistent error handling
6. ❌ `filterCasesByAccess` and `canAccessCase` should be middleware

**Recommended Changes:**
```typescript
// MOVE TO SERVER-SIDE: /src/lib/services/server/caseService.ts
import { Case as CaseModel } from '@/lib/models';
import { dbConnect } from './db';

export async function getCases(filters?: {
  facilityId?: string;
  status?: string;
  district?: string;
}) {
  await dbConnect();
  const query: any = {};
  if (filters?.facilityId) query.facilityId = filters.facilityId;
  if (filters?.status) query.validationStatus = filters.status;
  if (filters?.district) query.district = filters.district;
  
  return CaseModel.find(query).lean();
}

export async function createCase(data: {
  patientId: string;
  diseaseCode: string;
  symptoms: string[];
  onsetDate: Date;
  facilityId: string;
  reporterId: string;
}) {
  await dbConnect();
  return CaseModel.create({
    ...data,
    reportDate: new Date(),
    validationStatus: 'pending',
  });
}
```

**Impact:** Proper separation of concerns, server-side validation

---

### ❌ patientService.ts - SIMILAR ISSUES
**Expected Issues:**
- Same client-side architecture problem
- Needs to be server-side service

---

### ❌ userService.ts - SIMILAR ISSUES
**Expected Issues:**
- Same client-side architecture problem
- Password hashing should be in service, not API route

---

### ❌ facilityService.ts - SIMILAR ISSUES
**Expected Issues:**
- Same client-side architecture problem

---

### ✅ db.ts - LIKELY OK
**Status:** Database connection utility, probably fine

---

## Forms Layer (`/src/components/forms/`)

### ⚠️ CaseReportForm.tsx - GOOD BUT NEEDS IMPROVEMENTS
**Current State:** 4 core fields, using SearchableSelect  
**Good Points:**
1. ✅ Using SearchableSelect for disease codes
2. ✅ Proper validation
3. ✅ Loading states
4. ✅ Error handling

**Issues:**
1. ⚠️ Patient ID as text input - should use SearchableSelect with patient search
2. ⚠️ Symptoms as checkboxes - could be SearchableSelect multi-select
3. ⚠️ No async patient lookup
4. ⚠️ Disease codes hardcoded - should come from API

**Recommended Changes:**
```typescript
// Replace Patient ID input with SearchableSelect
<SearchableSelect
  label="Patient *"
  value={formData.patientId}
  onChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
  options={patients.map(p => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName} (${p.nationalId})`
  }))}
  onSearch={async (term) => {
    const results = await fetch(`/api/patients/search?q=${term}`);
    return results.json();
  }}
  error={errors.patientId}
/>
```

**Impact:** Better UX, proper patient selection

---

### ❌ UserManagementForm.tsx - NOT EXAMINED YET
**Expected Issues:**
- Too many fields
- Not using SearchableSelect for facility/district
- Password field handling

---

### ❌ FacilityManagementForm.tsx - NOT EXAMINED YET
**Expected Issues:**
- Complex address fields
- Not using SearchableSelect for district/province

---

### ❌ ReportFilterForm.tsx - NOT EXAMINED YET
**Expected Issues:**
- Not using SearchableSelect for filters

---

## UI Components (`/src/components/ui/`)

### ⚠️ SearchableSelect.tsx - NEEDS ENHANCEMENTS
**Current State:** Basic implementation, works but limited  
**Good Points:**
1. ✅ Search functionality
2. ✅ Keyboard navigation (basic)
3. ✅ Click outside to close
4. ✅ Error states

**Missing Features:**
1. ❌ No TypeScript generics (not type-safe)
2. ❌ No async data loading
3. ❌ No multi-select support
4. ❌ No loading states
5. ❌ No clear/reset button
6. ❌ No custom option rendering
7. ❌ No keyboard shortcuts (Enter, Escape, Arrow keys)
8. ❌ No accessibility attributes (ARIA)

**Recommended Changes:**
```typescript
interface SearchableSelectProps<T> {
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
}

export function SearchableSelect<T = any>({ ... }: SearchableSelectProps<T>) {
  // Implementation with generics, async support, multi-select
}
```

**Impact:** Reusable, type-safe, feature-complete component

---

## API Routes (`/src/app/api/`)

### ❌ /api/cases/route.ts - NEEDS STANDARDIZATION
**Current State:** Basic CRUD, inconsistent responses  
**Issues:**
1. ❌ Returns raw data, not wrapped in standard response
2. ❌ No input validation (no Zod schemas)
3. ❌ Generic error messages
4. ❌ No pagination
5. ❌ No proper logging
6. ❌ Auth check but no role-based access control

**Recommended Changes:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getCases, createCase } from '@/lib/services/server/caseService';
import { ApiResponse } from '@/types';

const createCaseSchema = z.object({
  patientId: z.string().min(1),
  diseaseCode: z.string().min(1),
  symptoms: z.array(z.string()).min(1),
  onsetDate: z.string().datetime(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const cases = await getCases({
      facilityId: session.user.facilityId,
      page,
      limit
    });

    return NextResponse.json<ApiResponse<typeof cases>>({
      success: true,
      data: cases
    });
  } catch (error) {
    console.error('[API] Error fetching cases:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to fetch cases'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const body = await request.json();
    const validated = createCaseSchema.parse(body);

    const caseRecord = await createCase({
      ...validated,
      facilityId: session.user.facilityId,
      reporterId: session.user.id,
    });

    return NextResponse.json<ApiResponse<typeof caseRecord>>({
      success: true,
      data: caseRecord
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Validation failed',
        message: error.errors[0].message
      }, { status: 400 });
    }
    
    console.error('[API] Error creating case:', error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Failed to create case'
    }, { status: 500 });
  }
}
```

**Impact:** Consistent, validated, properly structured API

---

### ❌ Other API Routes - SIMILAR ISSUES
**Expected Issues:**
- /api/users/route.ts - Same standardization needed
- /api/patients/route.ts - Same standardization needed
- /api/facilities/route.ts - Same standardization needed
- /api/alerts/route.ts - Same standardization needed

---

## Types Layer (`/src/types/`)

### ✅ index.ts - GOOD STRUCTURE
**Current State:** Well-organized, comprehensive  
**Good Points:**
1. ✅ Clear sections with comments
2. ✅ Proper use of const enums
3. ✅ Good type exports

**Minor Issues:**
1. ⚠️ Some types have fields that don't match models
2. ⚠️ ApiResponse type not used consistently

**Recommended Changes:**
- Ensure types match simplified models
- Add JSDoc comments for complex types
- Export validation schemas alongside types

---

### ✅ forms.ts - GOOD STRUCTURE
**Current State:** Clean DTOs for forms  
**Good Points:**
1. ✅ Separate from main types
2. ✅ Clear purpose

**Issues:**
1. ⚠️ Should match simplified models
2. ⚠️ Missing some form types (login, register)

---

## Middleware Layer (`/src/lib/middleware/`)

### ❌ NOT EXAMINED YET
**Expected Files:**
- auth.ts - Authentication middleware
- validate.ts - Validation middleware
- errorHandler.ts - Error handling middleware

**Expected Issues:**
- May not be used consistently across API routes
- Validation middleware not integrated with Zod schemas

---

## Summary of Critical Files Needing Immediate Attention

### 🔴 HIGH PRIORITY (Fix First)
1. `/src/lib/models/Patient.ts` - Simplify to 9 fields
2. `/src/lib/models/Case.ts` - Simplify to 10 fields
3. `/src/lib/services/caseService.ts` - Move to server-side
4. `/src/app/api/cases/route.ts` - Standardize responses, add validation
5. `/src/components/ui/SearchableSelect.tsx` - Add generics, async, multi-select

### 🟡 MEDIUM PRIORITY (Fix Second)
6. `/src/lib/models/User.ts` - Minor cleanup
7. `/src/lib/services/patientService.ts` - Move to server-side
8. `/src/app/api/patients/route.ts` - Standardize
9. `/src/components/forms/CaseReportForm.tsx` - Use SearchableSelect for patient
10. `/src/components/forms/UserManagementForm.tsx` - Simplify fields

### 🟢 LOW PRIORITY (Polish Later)
11. `/src/lib/models/Facility.ts` - Review and simplify
12. `/src/lib/models/Alert.ts` - Review and simplify
13. Dashboard components - Polish after core fixes
14. Other API routes - Standardize after pattern established

---

## Estimated Effort

### Phase 1: Models (2 days)
- Patient.ts: 2 hours
- Case.ts: 2 hours
- User.ts: 1 hour
- Migration script: 3 hours
- Testing: 2 hours

### Phase 2: Services (2 days)
- Restructure to server-side: 4 hours
- caseService: 2 hours
- patientService: 2 hours
- userService: 2 hours

### Phase 3: API Routes (3 days)
- Create standard response wrapper: 1 hour
- cases/route.ts: 2 hours
- patients/route.ts: 2 hours
- users/route.ts: 2 hours
- facilities/route.ts: 2 hours
- Add validation middleware: 3 hours
- Testing: 4 hours

### Phase 4: UI Components (2 days)
- SearchableSelect refactor: 4 hours
- CaseReportForm updates: 2 hours
- UserManagementForm updates: 2 hours
- FacilityManagementForm updates: 2 hours

### Phase 5: Integration & Testing (3 days)
- Integration testing: 8 hours
- Bug fixes: 8 hours
- Documentation: 4 hours

**Total: 12 days (2.4 weeks)**

---

## Next Action Items

1. ✅ Review this analysis
2. ⬜ Create backup branch
3. ⬜ Start with Patient.ts model simplification
4. ⬜ Create migration script for existing data
5. ⬜ Update types to match new models
6. ⬜ Proceed with service layer refactoring

**Ready to start implementation?**
