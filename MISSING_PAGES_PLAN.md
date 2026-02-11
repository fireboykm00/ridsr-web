# Missing Pages Implementation Plan

## Pages to Create (7 total)

### 1. /dashboard/national
- National-level dashboard
- Admin/National Officer only
- Show national statistics
- Link to all districts

### 2. /dashboard/patients
- List all patients
- Search/filter functionality
- Add new patient button
- Edit/delete patient
- Role-based access

### 3. /dashboard/alerts
- List all alerts
- Filter by status/severity
- Search functionality
- Alert details modal

### 4. /dashboard/reports
- List all reports
- Filter by type/date
- Generate new report
- Download/export

### 5. /dashboard/users
- User management (admin only)
- Add new user
- Assign to facility
- Edit/delete user
- Auto-load facilities

### 6. /dashboard/facilities
- Facility management (admin only)
- Add new facility
- Edit facility
- Delete facility
- Assign users to facility

### 7. /dashboard/validation (redirect to validation-hub)
- Alias for validation-hub

## Components to Use

- CustomSelect with options
- Input for search
- Table for listing
- Modal for forms
- Button for actions
- Card for layout

## Forms to Create

### Add User Form
- Name (Input)
- Email (Input)
- Worker ID (Input)
- Role (CustomSelect)
- Facility (CustomSelect - auto-loaded)
- Password (PasswordInput)

### Add Facility Form
- Name (Input)
- Type (CustomSelect)
- District (CustomSelect)
- Province (CustomSelect)
- Address (Input)
- Phone (Input)

### Add Patient Form
- First Name (Input)
- Last Name (Input)
- National ID (Input)
- Date of Birth (Input)
- Gender (CustomSelect)
- Phone (Input)
- Email (Input)
- Address (Input)
- Facility (CustomSelect)

## API Integration

- Use existing services
- Fetch data on mount
- Handle loading/error states
- Implement search/filter

## Styling

- Use existing Card, Button, Input components
- Consistent with current design
- Responsive layout
- Dark/light mode support

