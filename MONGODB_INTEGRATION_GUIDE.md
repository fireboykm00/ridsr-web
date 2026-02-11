# MongoDB Integration Implementation Guide

## Quick Start

### 1. Environment Setup
```bash
# .env.local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ridsr-db
```

### 2. Install Dependencies
```bash
npm install mongoose bcryptjs
npm install -D @types/mongoose
```

### 3. Models Created ✅
- `src/lib/models/User.ts`
- `src/lib/models/Facility.ts`
- `src/lib/models/Patient.ts`
- `src/lib/models/Case.ts`
- `src/lib/models/Alert.ts`
- `src/lib/models/ThresholdRule.ts`

---

## Implementation Pattern

### Service Layer (Before → After)

**Before (API Call)**:
```typescript
async getAllUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}
```

**After (MongoDB)**:
```typescript
async getAllUsers(): Promise<User[]> {
  const session = await auth();
  if (!session?.user?.role !== USER_ROLES.ADMIN) {
    throw new Error('Unauthorized');
  }
  
  await dbConnect();
  const users = await User.find({}).lean();
  return users;
}
```

---

## API Route Pattern

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

## Next.js 16 Params Fix

### Old Syntax (Next.js 13)
```typescript
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
}
```

### New Syntax (Next.js 16)
```typescript
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

---

## Implementation Checklist

### Phase 1: Models ✅
- [x] User.ts
- [x] Facility.ts
- [x] Patient.ts
- [x] Case.ts
- [x] Alert.ts
- [x] ThresholdRule.ts

### Phase 2: Services (TODO)
- [ ] Update userService.ts
- [ ] Update patientService.ts
- [ ] Update facilityService.ts
- [ ] Update caseService.ts
- [ ] Update dashboardService.ts
- [ ] Update thresholdEngineService.ts

### Phase 3: API Routes (TODO)
- [ ] /api/users/route.ts
- [ ] /api/users/[id]/route.ts
- [ ] /api/patients/route.ts
- [ ] /api/patients/[id]/route.ts
- [ ] /api/facilities/route.ts
- [ ] /api/facilities/[id]/route.ts
- [ ] /api/cases/route.ts
- [ ] /api/cases/[id]/route.ts
- [ ] /api/alerts/route.ts
- [ ] /api/alerts/[id]/route.ts

### Phase 4: Testing (TODO)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

## File Structure
```
src/lib/
├── models/
│   ├── User.ts
│   ├── Facility.ts
│   ├── Patient.ts
│   ├── Case.ts
│   ├── Alert.ts
│   ├── ThresholdRule.ts
│   └── index.ts
├── services/
│   ├── userService.ts (refactored)
│   ├── patientService.ts (refactored)
│   ├── facilityService.ts (refactored)
│   ├── caseService.ts (refactored)
│   ├── dashboardService.ts (refactored)
│   ├── thresholdEngineService.ts (refactored)
│   └── db.ts (already good)
└── ...
```

---

## Next Steps

1. Update `.env.local` with MongoDB URI
2. Test MongoDB connection with `npm run dev`
3. Refactor services one by one
4. Update API routes
5. Test all endpoints
6. Deploy to production

---

**Status**: ✅ Models Created - Ready for Service Refactoring
