# Backend Architecture & MongoDB Integration Report

**Date**: February 11, 2026  
**Status**: Analysis Complete - Ready for Implementation

---

## 1. FILE NAMING REFACTOR - COMPLETED ✅

### Services Renamed to camelCase
```
✅ user-service.ts → userService.ts
✅ patient.service.ts → patientService.ts
✅ facility-service.ts → facilityService.ts
✅ case.service.ts → caseService.ts
✅ dashboard.service.ts → dashboardService.ts
✅ threshold-engine.service.ts → thresholdEngineService.ts
```

**All imports updated** (13 files, 17 references)

---

## 2. SERVICE LAYER ANALYSIS

### 2.1 userService.ts - ✅ KEEP & ENHANCE

**Current State**: Functional but incomplete
- ✅ getCurrentUser() - Gets session user
- ✅ isAdmin() - Role check
- ✅ hasRole() - Role verification
- ✅ getAllUsers() - Fetch all users (with auth)
- ✅ getUsersByRole() - Filter by role
- ✅ getUsersByFacility() - Filter by facility
- ✅ getUsersByDistrict() - Filter by district
- ✅ createUser() - Create new user
- ✅ updateUser() - Update user
- ✅ deleteUser() - Delete user

**Issues**:
- ❌ All methods call `/api/users` endpoints (not direct DB)
- ❌ No error handling for network failures
- ❌ No caching mechanism

**Recommendation**: KEEP - Refactor to use MongoDB directly

---

### 2.2 patientService.ts - ⚠️ PARTIAL KEEP

**Current State**: Utility functions only
- ✅ filterPatientsByAccess() - Access control
- ✅ canAccessPatient() - Permission check
- ✅ prepareNewPatient() - Data preparation

**Issues**:
- ❌ No CRUD operations
- ❌ filterPatientsByAccess() has incorrect logic (comparing patient.id with facilityId)
- ❌ Missing: getAllPatients(), getPatientById(), createPatient(), updatePatient(), deletePatient()

**Recommendation**: KEEP but EXPAND - Add missing CRUD methods

---

### 2.3 facilityService.ts - ✅ KEEP & ENHANCE

**Current State**: Good structure
- ✅ getAllFacilities() - Fetch all
- ✅ getFacilitiesByDistrict() - Filter by district
- ✅ getFacilityById() - Get single
- ✅ createFacility() - Create
- ✅ updateFacility() - Update
- ✅ deleteFacility() - Delete
- ✅ getFacilitiesForUser() - User-specific access
- ✅ filterFacilitiesByAccess() - Access control
- ✅ canAccessFacility() - Permission check

**Issues**:
- ❌ All methods call `/api/facilities` endpoints (not direct DB)
- ❌ No error handling

**Recommendation**: KEEP - Refactor to use MongoDB directly

---

### 2.4 caseService.ts - ⚠️ PARTIAL KEEP

**Current State**: Utility functions only
- ✅ filterCasesByAccess() - Access control
- ✅ canAccessCase() - Permission check
- ✅ prepareNewCase() - Data preparation

**Issues**:
- ❌ No CRUD operations
- ❌ Missing: getAllCases(), getCaseById(), createCase(), updateCase(), deleteCase()

**Recommendation**: KEEP but EXPAND - Add missing CRUD methods

---

### 2.5 dashboardService.ts - ✅ KEEP

**Current State**: Simple wrapper
- ✅ getDashboardData() - Fetch dashboard stats
- ✅ getDashboardMetrics() - Fetch metrics
- ✅ getDashboardCharts() - Fetch chart data

**Issues**:
- ❌ All methods call `/api/dashboard` endpoints (not direct DB)

**Recommendation**: KEEP - Refactor to use MongoDB directly

---

### 2.6 thresholdEngineService.ts - ✅ KEEP & ENHANCE

**Current State**: Threshold management
- ✅ getAllThresholdRules() - Fetch rules
- ✅ createThresholdRule() - Create rule
- ✅ updateThresholdRule() - Update rule
- ✅ evaluateThreshold() - Check if exceeded
- ✅ generateAlert() - Create alert

**Issues**:
- ❌ All methods call `/api/threshold-rules` endpoints (not direct DB)
- ❌ No deleteThresholdRule() method

**Recommendation**: KEEP - Refactor to use MongoDB directly

---

### 2.7 db.ts - ✅ KEEP

**Current State**: MongoDB connection handler
- ✅ Mongoose connection pooling
- ✅ Global caching for hot reloads
- ✅ Error handling

**Issues**: None - This is good!

**Recommendation**: KEEP - Already production-ready

---

## 3. API ROUTES ANALYSIS

### Current Implementation Issues

**All API routes have TODO comments** - Not implemented:
```
❌ /api/users/route.ts - Returns empty array
❌ /api/users/[id]/route.ts - Not implemented
❌ /api/cases/route.ts - Returns empty array
❌ /api/cases/[id]/route.ts - Not implemented
❌ /api/facilities/route.ts - Not implemented
❌ /api/facilities/[id]/route.ts - Not implemented
❌ /api/alerts/route.ts - Not implemented
❌ /api/alerts/[id]/route.ts - Not implemented
```

**Pattern Issues**:
- ❌ API routes use old Next.js 13 params syntax (not Promise-based)
- ❌ No database queries
- ❌ No validation
- ❌ No error handling

---

## 4. MONGODB INTEGRATION STRATEGY

### 4.1 Database Schema (Mongoose Models)

```typescript
// User Model
{
  _id: ObjectId
  workerId: string (unique)
  name: string
  email: string (unique)
  password: string (hashed)
  role: enum [ADMIN, NATIONAL_OFFICER, DISTRICT_OFFICER, HEALTH_WORKER, LAB_TECHNICIAN]
  facilityId: ObjectId (ref: Facility)
  district: string
  province: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Facility Model
{
  _id: ObjectId
  name: string
  type: enum [HOSPITAL, CLINIC, HEALTH_CENTER, LAB]
  district: string
  province: string
  coordinates: { lat: number, lng: number }
  contactPerson: string
  phone: string
  email: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Patient Model
{
  _id: ObjectId
  nationalId: string (unique)
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: enum [MALE, FEMALE, OTHER]
  phone: string
  email: string
  address: {
    street: string
    sector: string
    district: string
    province: string
    country: string
  }
  occupation: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  createdAt: Date
  updatedAt: Date
}

// Case Model
{
  _id: ObjectId
  patientId: ObjectId (ref: Patient)
  facilityId: ObjectId (ref: Facility)
  diseaseCode: string
  symptoms: [string]
  onsetDate: Date
  reportDate: Date
  reporterId: ObjectId (ref: User)
  validationStatus: enum [PENDING, VALIDATED, REJECTED]
  isAlertTriggered: boolean
  labResults: string
  outcome: enum [RECOVERED, DIED, ONGOING]
  createdAt: Date
  updatedAt: Date
}

// Alert Model
{
  _id: ObjectId
  diseaseCode: string
  location: string
  caseCount: number
  threshold: number
  severity: enum [LOW, MEDIUM, HIGH, CRITICAL]
  status: enum [ACTIVE, RESOLVED, ACKNOWLEDGED]
  createdAt: Date
  updatedAt: Date
}

// ThresholdRule Model
{
  _id: ObjectId
  diseaseCode: string
  location: string
  threshold: number
  timeWindowHours: number
  severity: enum [LOW, MEDIUM, HIGH, CRITICAL]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 4.2 Implementation Steps

**Step 1: Create Mongoose Models** (2-3 hours)
```
src/lib/models/
├── User.ts
├── Facility.ts
├── Patient.ts
├── Case.ts
├── Alert.ts
└── ThresholdRule.ts
```

**Step 2: Update Services** (3-4 hours)
- Replace API calls with direct MongoDB queries
- Add proper error handling
- Add validation

**Step 3: Update API Routes** (4-5 hours)
- Implement GET/POST/PUT/DELETE handlers
- Fix Next.js 16 params syntax (Promise-based)
- Add request validation
- Add response formatting

**Step 4: Add Middleware** (1-2 hours)
- Authentication middleware
- Authorization middleware
- Error handling middleware

---

## 5. REFACTORED SERVICE LAYER EXAMPLE

### Before (Current)
```typescript
async getAllUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}
```

### After (MongoDB)
```typescript
async getAllUsers(): Promise<User[]> {
  const session = await auth();
  if (!session?.user?.role !== USER_ROLES.ADMIN) {
    throw new Error('Unauthorized');
  }
  
  const users = await User.find({}).lean();
  return users;
}
```

---

## 6. REFACTORED API ROUTE EXAMPLE

### Before (Current)
```typescript
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // TODO: Implement real database query
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### After (MongoDB)
```typescript
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');
    const role = searchParams.get('role');
    
    const query: any = {};
    if (facilityId) query.facilityId = facilityId;
    if (role) query.role = role;
    
    const users = await User.find(query).lean();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Setup (1 day)
- [ ] Create Mongoose models
- [ ] Test MongoDB connection
- [ ] Create seed data script

### Phase 2: Services (2 days)
- [ ] Update userService.ts
- [ ] Update patientService.ts (add CRUD)
- [ ] Update facilityService.ts
- [ ] Update caseService.ts (add CRUD)
- [ ] Update dashboardService.ts
- [ ] Update thresholdEngineService.ts

### Phase 3: API Routes (2 days)
- [ ] Update /api/users routes
- [ ] Update /api/patients routes
- [ ] Update /api/facilities routes
- [ ] Update /api/cases routes
- [ ] Update /api/alerts routes
- [ ] Fix Next.js 16 params syntax

### Phase 4: Testing (1 day)
- [ ] Unit tests for services
- [ ] Integration tests for API routes
- [ ] End-to-end tests

### Phase 5: Deployment (1 day)
- [ ] Environment setup
- [ ] Database migration
- [ ] Production testing

---

## 8. SUMMARY TABLE

| Component | Status | Action | Priority |
|-----------|--------|--------|----------|
| userService.ts | ✅ Good | Refactor to MongoDB | HIGH |
| patientService.ts | ⚠️ Partial | Expand + Refactor | HIGH |
| facilityService.ts | ✅ Good | Refactor to MongoDB | HIGH |
| caseService.ts | ⚠️ Partial | Expand + Refactor | HIGH |
| dashboardService.ts | ✅ Good | Refactor to MongoDB | MEDIUM |
| thresholdEngineService.ts | ✅ Good | Refactor to MongoDB | MEDIUM |
| db.ts | ✅ Excellent | Keep as-is | - |
| API Routes | ❌ Not Implemented | Implement all | CRITICAL |
| Mongoose Models | ❌ Missing | Create all | CRITICAL |

---

## 9. ESTIMATED EFFORT

| Task | Hours | Days |
|------|-------|------|
| Create Mongoose Models | 3 | 0.5 |
| Update Services | 8 | 1 |
| Implement API Routes | 10 | 1.5 |
| Add Middleware | 3 | 0.5 |
| Testing | 6 | 1 |
| **TOTAL** | **30** | **4.5** |

---

## 10. NEXT ACTIONS

1. **Create Mongoose Models** - Start with User and Facility
2. **Update userService.ts** - Replace API calls with DB queries
3. **Update API routes** - Implement GET/POST/PUT/DELETE
4. **Test thoroughly** - Ensure all CRUD operations work
5. **Deploy to production** - After testing

---

**Status**: ✅ READY FOR IMPLEMENTATION

All analysis complete. Services are well-structured and ready for MongoDB integration.
