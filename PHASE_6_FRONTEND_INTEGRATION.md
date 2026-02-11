# Phase 6: Frontend Integration - Implementation Guide

**Status**: Ready to Start  
**Objective**: Connect frontend to MongoDB backend

---

## Overview

The backend is complete with:
- ✅ 25 API endpoints
- ✅ Full CRUD operations
- ✅ Authentication & authorization
- ✅ MongoDB integration
- ✅ All tests passing

Now we integrate the frontend to use these endpoints.

---

## Step 1: Update Frontend Services

### Before (Using API endpoints)
```typescript
// Old approach - calling API endpoints
const users = await fetch('/api/users').then(r => r.json());
```

### After (Using services directly)
```typescript
// New approach - using services directly
import { userService } from '@/lib/services/userService';
const users = await userService.getAllUsers();
```

---

## Step 2: Update Components

### Example: UserList Component

**Before**:
```typescript
'use client';
import { useEffect, useState } from 'react';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{users.map(u => <div key={u.id}>{u.name}</div>)}</div>;
}
```

**After**:
```typescript
'use client';
import { useEffect, useState } from 'react';
import { userService } from '@/lib/services/userService';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService.getAllUsers()
      .then(setUsers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{users.map(u => <div key={u.id}>{u.name}</div>)}</div>;
}
```

---

## Step 3: Update All Dashboard Pages

### Pages to Update

1. **User Management** (`/dashboard/user/page.tsx`)
   - Replace API calls with `userService`
   - Update create/update/delete operations

2. **Facility Management** (`/dashboard/facility/page.tsx`)
   - Replace API calls with `facilityService`
   - Update CRUD operations

3. **Patient Management** (`/dashboard/patient/page.tsx`)
   - Replace API calls with patient service functions
   - Update CRUD operations

4. **Case Management** (`/dashboard/case/page.tsx`)
   - Replace API calls with case service functions
   - Update CRUD operations

5. **Alert Management** (`/dashboard/alert/page.tsx`)
   - Replace API calls with alert service functions
   - Update CRUD operations

6. **Report Generation** (`/dashboard/report/page.tsx`)
   - Replace API calls with dashboard service
   - Update chart/metric fetching

---

## Step 4: Update Forms

### Example: UserManagementForm

**Before**:
```typescript
async function handleSubmit(data: CreateUserInput) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
```

**After**:
```typescript
import { userService } from '@/lib/services/userService';

async function handleSubmit(data: CreateUserInput) {
  return userService.createUser(data);
}
```

---

## Step 5: Error Handling

Add proper error handling for all service calls:

```typescript
try {
  const users = await userService.getAllUsers();
  setUsers(users);
} catch (error) {
  if (error instanceof Error) {
    setError(error.message);
  } else {
    setError('An unexpected error occurred');
  }
}
```

---

## Step 6: Loading States

Add loading indicators:

```typescript
const [loading, setLoading] = useState(false);

async function handleCreate(data: CreateUserInput) {
  setLoading(true);
  try {
    const user = await userService.createUser(data);
    setUsers([...users, user]);
  } finally {
    setLoading(false);
  }
}
```

---

## Step 7: Testing Frontend Integration

### Test Checklist

- [ ] User creation works
- [ ] User list displays
- [ ] User update works
- [ ] User deletion works
- [ ] Facility CRUD works
- [ ] Patient CRUD works
- [ ] Case CRUD works
- [ ] Alert CRUD works
- [ ] Error messages display
- [ ] Loading states show
- [ ] Authentication required
- [ ] Authorization enforced

---

## Step 8: Deployment

### Pre-Deployment Checklist

- [ ] All frontend pages updated
- [ ] All forms use services
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Tests passing
- [ ] No console errors
- [ ] No TypeScript errors

### Deploy Steps

```bash
# 1. Build
npm run build

# 2. Test
npm test

# 3. Deploy
npm start
```

---

## Files to Update

### Dashboard Pages
- `/dashboard/user/page.tsx`
- `/dashboard/facility/page.tsx`
- `/dashboard/patient/page.tsx`
- `/dashboard/case/page.tsx`
- `/dashboard/alert/page.tsx`
- `/dashboard/report/page.tsx`

### Forms
- `UserManagementForm.tsx`
- `FacilityManagementForm.tsx`
- `CaseReportForm.tsx`
- `ReportFilterForm.tsx`

### Components
- `UserList.tsx`
- `FacilityList.tsx`
- `PatientList.tsx`
- `CaseList.tsx`
- `AlertList.tsx`

---

## Service Usage Reference

### User Service
```typescript
import { userService } from '@/lib/services/userService';

// Get all users
const users = await userService.getAllUsers();

// Get user by ID
const user = await userService.getUserById(id);

// Create user
const newUser = await userService.createUser(userData);

// Update user
const updated = await userService.updateUser(id, updateData);

// Delete user
const deleted = await userService.deleteUser(id);
```

### Facility Service
```typescript
import { facilityService } from '@/lib/services/facilityService';

// Get all facilities
const facilities = await facilityService.getAllFacilities();

// Get facility by ID
const facility = await facilityService.getFacilityById(id);

// Create facility
const newFacility = await facilityService.createFacility(data);

// Update facility
const updated = await facilityService.updateFacility(id, data);

// Delete facility
const deleted = await facilityService.deleteFacility(id);
```

### Patient Service
```typescript
import { 
  getAllPatients, 
  getPatientById, 
  createPatient, 
  updatePatient, 
  deletePatient 
} from '@/lib/services/patientService';

// Get all patients
const patients = await getAllPatients();

// Create patient
const newPatient = await createPatient(data);

// Update patient
const updated = await updatePatient(id, data);

// Delete patient
const deleted = await deletePatient(id);
```

### Case Service
```typescript
import { 
  getAllCases, 
  getCaseById, 
  createCase, 
  updateCase, 
  deleteCase 
} from '@/lib/services/caseService';

// Get all cases
const cases = await getAllCases();

// Create case
const newCase = await createCase(data);

// Update case
const updated = await updateCase(id, data);

// Delete case
const deleted = await deleteCase(id);
```

---

## Common Patterns

### List with Search
```typescript
'use client';
import { useEffect, useState } from 'react';
import { userService } from '@/lib/services/userService';

export function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getAllUsers()
      .then(data => setUsers(data.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase())
      )))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div>
      <input 
        placeholder="Search..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading ? <div>Loading...</div> : (
        <div>{users.map(u => <div key={u.id}>{u.name}</div>)}</div>
      )}
    </div>
  );
}
```

### Create with Form
```typescript
'use client';
import { useState } from 'react';
import { userService } from '@/lib/services/userService';

export function CreateUserForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const user = await userService.createUser({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        // ... other fields
      });
      console.log('User created:', user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      {error && <div className="error">{error}</div>}
      <button disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
    </form>
  );
}
```

---

## Next Steps

1. ✅ Backend complete (Phase 1-5)
2. ⏳ Update frontend pages (Phase 6)
3. ⏳ Test all CRUD operations
4. ⏳ Deploy to production

---

**Status**: Ready to implement Phase 6

Start by updating the dashboard pages to use the new services.
