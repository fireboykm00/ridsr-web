# PHASE 8: CORE IMPLEMENTATION - MVP REQUIREMENTS

## Executive Summary

Focus on **4 core user workflows** that solve Rwanda's disease surveillance problem:

1. **Admin Setup** - Create facilities, add users with roles
2. **Health Worker** - Report cases linked to patients
3. **Nurse** - Manage patients, view cases
4. **District Officer** - View district data, add facilities

---

## TASK BREAKDOWN

### TASK 1: Remove Registration Page & Implement Admin-Only User Creation

**Current State:**
- Public registration page exists
- Users can self-register

**Required State:**
- Remove `/register` page
- Only admin can create users
- Users receive credentials via email (future)
- Users sign in with email + password

**Files to Modify:**
1. Delete `/src/app/register/page.tsx`
2. Update `/src/app/(main)/dashboard/admin/` to have user creation form
3. Update sidebar to remove register link

**Implementation:**
```typescript
// Admin User Creation Form
- Email (required, unique)
- Password (auto-generated or admin-set)
- Full Name
- Role (dropdown: Admin, National Officer, District Officer, Health Worker, Lab Technician)
- Facility (searchable select - only if role is Health Worker/Lab Tech)
- District (searchable select - only if role is District Officer)
```

**API Endpoint Needed:**
- `POST /api/users` - Create user (admin only)

---

### TASK 2: Implement Facility Management (Admin Only)

**Current State:**
- Facility page exists but may be incomplete

**Required State:**
- Admin can create facilities with:
  - Name
  - Code
  - Type (Health Center, Hospital, Clinic, etc.)
  - District
  - Province
  - Address details
  - Coordinates (optional)

**Files to Modify:**
1. `/src/app/(main)/dashboard/admin/facilities/page.tsx` - Create/edit form
2. Ensure API endpoints work: `POST /api/facilities`, `PUT /api/facilities/[id]`

**Implementation:**
```typescript
// Facility Form Fields
- Name (required)
- Code (required, unique)
- Type (dropdown)
- District (searchable select)
- Province (auto-filled based on district)
- Street Address
- Sector
- Coordinates (lat/long)
```

---

### TASK 3: Implement Patient Management (Nurse/Health Worker)

**Current State:**
- Patient page exists

**Required State:**
- Health workers can search/create patients
- Link patients to cases
- Search by National ID (NID) - future integration
- Manual patient creation with:
  - National ID
  - First Name
  - Last Name
  - Date of Birth
  - Gender
  - Phone
  - Address (District, Sector, Cell)

**Files to Modify:**
1. `/src/app/(main)/dashboard/patient/page.tsx` - Patient list + create form
2. Ensure API endpoints work: `GET /api/patients`, `POST /api/patients`, `PUT /api/patients/[id]`

**Implementation:**
```typescript
// Patient Form Fields
- National ID (required, unique)
- First Name (required)
- Last Name (required)
- Date of Birth (required)
- Gender (dropdown)
- Phone
- Address:
  - District (searchable select)
  - Sector
  - Cell
  - Village
```

---

### TASK 4: Implement Case Reporting (Health Worker)

**Current State:**
- Report case page exists

**Required State:**
- Health worker can report cases linked to patients
- Form flow:
  1. Search/select patient (by NID or name)
  2. Select disease/symptoms
  3. Enter onset date
  4. Submit

**Files to Modify:**
1. `/src/app/(main)/dashboard/report-case/page.tsx` - Simplify form
2. Ensure API endpoints work: `POST /api/cases`

**Implementation:**
```typescript
// Case Report Form
- Patient (searchable select - required)
- Disease Code (dropdown - required)
- Symptoms (multi-select chips)
- Onset Date (date picker)
- Facility (auto-filled from user)
- Reporter (auto-filled from user)
```

---

### TASK 5: Implement Case Management (Nurse/Health Worker)

**Current State:**
- Cases page exists

**Required State:**
- View all cases (filtered by facility for health workers)
- View case details
- Update case status
- Link to patient info

**Files to Modify:**
1. `/src/app/(main)/dashboard/cases/page.tsx` - Case list + detail view
2. Ensure API endpoints work: `GET /api/cases`, `GET /api/cases/[id]`, `PUT /api/cases/[id]`

---

### TASK 6: Implement District Officer Dashboard

**Current State:**
- District page exists

**Required State:**
- District officer can:
  - View all cases in their district
  - View all facilities in their district
  - Add new facilities to their district
  - Cannot modify users or other districts

**Files to Modify:**
1. `/src/app/(main)/dashboard/district/[district]/page.tsx` - District view
2. Add facility creation form for district officers

---

### TASK 7: Implement Role-Based Access Control (RBAC)

**Current State:**
- RBAC exists but may not be enforced

**Required State:**
- Admin: Full access to all features
- National Officer: View all data, manage alerts
- District Officer: View district data, add facilities
- Health Worker: Report cases, manage patients
- Lab Technician: Enter lab results

**Files to Modify:**
1. Update all API routes to check user role
2. Update all pages to check user role
3. Update sidebar to show only relevant links

---

### TASK 8: Simplify & Remove Redundant Code

**Files to Delete:**
- `/src/app/register/page.tsx` - Remove public registration
- Any unused components
- Any unused services

**Files to Simplify:**
- Remove all analytics/dashboard metrics
- Remove all unused form fields
- Remove all unused API endpoints

---

## IMPLEMENTATION ORDER

### Phase 8.1: Foundation (Day 1)
1. ✅ Delete register page
2. ✅ Update sidebar navigation
3. ✅ Verify API endpoints exist

### Phase 8.2: Admin Features (Day 2)
4. ✅ Implement user creation form
5. ✅ Implement facility creation form
6. ✅ Test admin workflows

### Phase 8.3: Core Features (Day 3)
7. ✅ Implement patient management
8. ✅ Implement case reporting
9. ✅ Implement case management

### Phase 8.4: District Features (Day 4)
10. ✅ Implement district officer dashboard
11. ✅ Implement district facility management

### Phase 8.5: Polish (Day 5)
12. ✅ RBAC enforcement
13. ✅ Code cleanup
14. ✅ Testing

---

## USER WORKFLOWS

### Workflow 1: Admin Setup

```
1. Admin logs in
2. Admin → User Management
3. Admin creates user:
   - Email: nurse@facility.rw
   - Password: [auto-generated]
   - Role: Health Worker
   - Facility: [select from list]
4. System creates user
5. Nurse receives credentials
6. Nurse logs in with email + password
```

### Workflow 2: Health Worker Reports Case

```
1. Health Worker logs in
2. Health Worker → Report Case
3. Search patient by NID or name
4. Select patient
5. Fill case details:
   - Disease
   - Symptoms
   - Onset date
6. Submit
7. Case linked to patient
8. Case visible in Cases list
```

### Workflow 3: Nurse Manages Patients

```
1. Nurse logs in
2. Nurse → Patients
3. Search patient or create new
4. View patient details
5. See linked cases
6. Update patient info
```

### Workflow 4: District Officer Views District

```
1. District Officer logs in
2. Dashboard shows district data
3. Can view:
   - All cases in district
   - All facilities in district
   - All health workers in district
4. Can add new facility to district
5. Cannot modify users or other districts
```

---

## API ENDPOINTS REQUIRED

### Users
- `POST /api/users` - Create user (admin only)
- `GET /api/users` - List users (admin only)
- `PUT /api/users/[id]` - Update user (admin only)
- `DELETE /api/users/[id]` - Delete user (admin only)

### Facilities
- `POST /api/facilities` - Create facility (admin/district officer)
- `GET /api/facilities` - List facilities
- `PUT /api/facilities/[id]` - Update facility (admin only)
- `DELETE /api/facilities/[id]` - Delete facility (admin only)

### Patients
- `POST /api/patients` - Create patient (health worker)
- `GET /api/patients` - List patients
- `GET /api/patients/[id]` - Get patient details
- `PUT /api/patients/[id]` - Update patient (health worker)
- `DELETE /api/patients/[id]` - Delete patient (admin only)

### Cases
- `POST /api/cases` - Create case (health worker)
- `GET /api/cases` - List cases
- `GET /api/cases/[id]` - Get case details
- `PUT /api/cases/[id]` - Update case (health worker)
- `DELETE /api/cases/[id]` - Delete case (admin only)

---

## FORMS NEEDED

### 1. User Creation Form (Admin)
- Email
- Password
- Full Name
- Role (dropdown)
- Facility (conditional - searchable select)
- District (conditional - searchable select)

### 2. Facility Creation Form (Admin/District Officer)
- Name
- Code
- Type
- District
- Province
- Address
- Coordinates

### 3. Patient Creation Form (Health Worker)
- National ID
- First Name
- Last Name
- Date of Birth
- Gender
- Phone
- Address (District, Sector, Cell, Village)

### 4. Case Report Form (Health Worker)
- Patient (searchable select)
- Disease Code (dropdown)
- Symptoms (multi-select)
- Onset Date
- Facility (auto-filled)
- Reporter (auto-filled)

---

## SUCCESS CRITERIA

- [ ] Admin can create users with roles
- [ ] Admin can create facilities
- [ ] Health worker can report cases
- [ ] Nurse can manage patients
- [ ] District officer can view district data
- [ ] All cases linked to patients
- [ ] RBAC enforced on all pages
- [ ] No public registration
- [ ] Build passes
- [ ] All workflows tested

---

## NEXT STEPS

1. Start with Task 1: Remove register page
2. Implement Task 2-6 in order
3. Test each workflow
4. Clean up redundant code
5. Final testing and deployment
