# Form Examples Documentation

## Overview
This document provides examples of how to use the simplified forms in the RIDSR project. All forms now use SearchableSelect components for better UX and reduced complexity.

## UserManagementForm

### Key Changes
- **Removed fields**: `workerId`, `districtId` (replaced with `district`)
- **Added SearchableSelect**: For facility and district selection with async search
- **Simplified validation**: Focused on essential fields only

### Usage Example
```tsx
import UserManagementForm from '@/components/forms/UserManagementForm';

const handleUserSubmit = async (data: UserFormData) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  // Handle response
};

<UserManagementForm
  onSubmit={handleUserSubmit}
  onCancel={() => setShowForm(false)}
  isEditing={false}
/>
```

### Form Fields
- **name** (required): Full name of the user
- **email** (required): Email address
- **role** (required): User role from predefined options
- **facilityId** (optional): Selected via SearchableSelect with async facility search
- **district** (optional): Selected via SearchableSelect with district search
- **password** (required for new users): Password
- **confirmPassword** (required for new users): Password confirmation

## FacilityManagementForm

### Key Changes
- **Removed complex address**: No more street, sector, province, country fields
- **Removed coordinates**: Latitude/longitude fields removed
- **Simplified to 4 core fields**: name, code, type, district
- **Added SearchableSelect**: For facility type and district selection

### Usage Example
```tsx
import FacilityManagementForm from '@/components/forms/FacilityManagementForm';

const handleFacilitySubmit = async (data: FacilityFormData) => {
  const response = await fetch('/api/facilities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  // Handle response
};

<FacilityManagementForm
  onSubmit={handleFacilitySubmit}
  onCancel={() => setShowForm(false)}
  isEditing={false}
/>
```

### Form Fields
- **name** (required): Facility name
- **code** (required): Unique facility code
- **type** (required): Facility type from predefined options
- **district** (required): District selected via SearchableSelect with search
- **isActive** (optional): Boolean flag for facility status

## SearchableSelect Features

### Async Search Support
Both forms use SearchableSelect with async search capabilities:

```tsx
<SearchableSelect
  label="Facility"
  value={formData.facilityId}
  onChange={(value) => setFormData(prev => ({ ...prev, facilityId: value || '' }))}
  onSearch={searchFacilities} // Async function
  placeholder="Search facilities..."
  isClearable
/>
```

### District Search
Districts are searched from a predefined list of Rwanda districts:
- Gasabo, Kicukiro, Nyarugenge (Kigali)
- Bugesera, Gatsibo, Kayonza, Kirehe, Ngoma, Nyagatare, Rwamagana (Eastern)
- Gicumbi, Rulindo, Gakenke, Musanze, Burera (Northern)
- Gisagara, Huye, Kamonyi, Muhanga, Nyamagabe, Nyanza, Nyaruguru, Ruhango (Southern)
- Karongi, Ngororero, Nyabihu, Rubavu, Rusizi, Nyamasheke, Rutsiro (Western)

### Facility Search
Facilities are searched via API endpoint `/api/facilities/search` with mock data:
- Kigali University Teaching Hospital (KUTH)
- King Faisal Hospital (KFH)
- Rwanda Military Hospital (RMH)
- Butaro Hospital (BH)
- And more...

## API Integration

### Facility Search Endpoint
```typescript
// GET /api/facilities/search?q=search_term
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Kigali University Teaching Hospital",
      "code": "KUTH"
    }
  ]
}
```

## Benefits of Simplified Forms

1. **Reduced Complexity**: 
   - UserManagementForm: 8 fields → 5 core fields
   - FacilityManagementForm: 15+ fields → 4 core fields

2. **Better UX**: 
   - SearchableSelect for all dropdowns
   - Async search for facilities and districts
   - Clear/reset functionality

3. **Improved Performance**: 
   - Fewer form fields to validate
   - Async loading only when needed
   - Reduced bundle size

4. **Maintainability**: 
   - Consistent form patterns
   - Reusable SearchableSelect component
   - Simplified validation logic

## Migration Notes

When migrating existing forms:
1. Update form data interfaces to match simplified models
2. Replace static dropdowns with SearchableSelect
3. Add async search functions for dynamic data
4. Remove unnecessary validation rules
5. Update API endpoints to handle simplified data structure