# RIDSR Platform Source Code Structure

Based on the BUSINESS_LOGIC.md documentation, here's the comprehensive source code structure for the RIDSR platform:

## Root Directory Structure

```
ridsr-web/
├── README.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
├── DESIGN_SYSTEM.md
├── IMPLEMENTATION_PLAN.md
├── PROJECT_GUIDELINES.md
├── BUSINESS_LOGIC.md
├── USER_EXPERIENCE.md
├── TECHNICAL_ARCHITECTURE.md
├── ITERATION_PHASES.md
├── ROADMAP.md
├── GOVERNANCE.md
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   ├── flags/
│   │   ├── rw.png
│   │   ├── fr.png
│   │   └── en.png
│   └── illustrations/
│       ├── dashboard.svg
│       ├── reporting.svg
│       └── validation.svg
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── error.tsx
    │   ├── not-found.tsx
    │   ├── globals.css
    │   ├── proxy.ts
    │   ├── page.tsx
    │   ├── api/
    │   │   ├── auth/
    │   │   │   ├── [...nextauth]/route.ts
    │   │   │   └── signin/route.ts
    │   │   ├── users/
    │   │   │   ├── route.ts
    │   │   │   ├── [id]/route.ts
    │   │   │   └── search/route.ts
    │   │   ├── facilities/
    │   │   │   ├── route.ts
    │   │   │   └── [id]/route.ts
    │   │   ├── cases/
    │   │   │   ├── route.ts
    │   │   │   ├── [id]/route.ts
    │   │   │   └── validate/[id]/route.ts
    │   │   ├── validation/
    │   │   │   ├── queue/route.ts
    │   │   │   └── [caseId]/route.ts
    │   │   ├── reports/
    │   │   │   ├── dashboard/route.ts
    │   │   │   ├── [type]/route.ts
    │   │   │   └── generate/route.ts
    │   │   ├── alerts/
    │   │   │   ├── route.ts
    │   │   │   └── [id]/route.ts
    │   │   └── search/
    │   │       └── route.ts
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── signin/page.tsx
    │   │   └── forgot-password/page.tsx
    │   ├── (main)/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx
    │   │   │   ├── facility/[id]/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── layout.tsx
    │   │   │   ├── district/[id]/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── layout.tsx
    │   │   │   └── national/
    │   │   │       ├── page.tsx
    │   │   │       └── layout.tsx
    │   │   ├── report-case/
    │   │   │   ├── page.tsx
    │   │   │   ├── search-patient/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── layout.tsx
    │   │   │   └── [diseaseCode]/
    │   │   │       ├── page.tsx
    │   │   │       └── layout.tsx
    │   │   ├── cases/
    │   │   │   ├── page.tsx
    │   │   │   ├── [id]/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── edit/page.tsx
    │   │   │   └── facility/[facilityId]/
    │   │   │       └── page.tsx
    │   │   ├── validation/
    │   │   │   ├── page.tsx
    │   │   │   ├── queue/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── layout.tsx
    │   │   │   └── [caseId]/
    │   │   │       ├── page.tsx
    │   │   │       └── layout.tsx
    │   │   ├── alerts/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx
    │   │   │       └── resolve/page.tsx
    │   │   ├── patients/
    │   │   │   ├── page.tsx
    │   │   │   ├── search/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── layout.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx
    │   │   │       └── edit/page.tsx
    │   │   ├── facilities/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx
    │   │   │       └── edit/page.tsx
    │   │   ├── users/
    │   │   │   ├── page.tsx
    │   │   │   ├── create/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── layout.tsx
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx
    │   │   │       └── edit/page.tsx
    │   │   ├── reports/
    │   │   │   ├── page.tsx
    │   │   │   ├── [type]/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── layout.tsx
    │   │   │   └── generate/
    │   │   │       ├── page.tsx
    │   │   │       └── layout.tsx
    │   │   ├── settings/
    │   │   │   ├── page.tsx
    │   │   │   └── profile/
    │   │   │       ├── page.tsx
    │   │   │       └── layout.tsx
    │   │   ├── about/
    │   │   │   ├── page.tsx
    │   │   │   └── layout.tsx
    │   │   ├── academy/
    │   │   │   ├── page.tsx
    │   │   │   └── layout.tsx
    │   │   ├── faq/
    │   │   │   ├── page.tsx
    │   │   │   └── layout.tsx
    │   │   └── privacy-policy/
    │   │       ├── page.tsx
    │   │       └── layout.tsx
    │   └── (admin)/
    │       ├── layout.tsx
    │       ├── admin/
    │       │   ├── page.tsx
    │       │   ├── users/
    │       │   │   ├── page.tsx
    │       │   │   └── create/page.tsx
    │       │   ├── facilities/
    │       │   │   ├── page.tsx
    │       │   │   └── create/page.tsx
    │       │   ├── reports/
    │       │   │   ├── page.tsx
    │       │   │   └── global/page.tsx
    │       │   └── system/
    │       │       ├── page.tsx
    │       │       └── settings/page.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── DashboardLayout.tsx
    │   │   ├── AuthLayout.tsx
    │   │   └── AdminLayout.tsx
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Card.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Table.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Select.tsx
    │   │   ├── Checkbox.tsx
    │   │   ├── RadioGroup.tsx
    │   │   ├── DatePicker.tsx
    │   │   ├── SearchableSelect.tsx
    │   │   ├── MultiSelect.tsx
    │   │   ├── FormFieldset.tsx
    │   │   ├── Form.tsx
    │   │   ├── Toast.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── Pagination.tsx
    │   │   ├── Tabs.tsx
    │   │   ├── Tooltip.tsx
    │   │   ├── Avatar.tsx
    │   │   ├── Dropdown.tsx
    │   │   ├── Breadcrumb.tsx
    │   │   ├── ProgressBar.tsx
    │   │   ├── Toggle.tsx
    │   │   ├── Slider.tsx
    │   │   ├── Accordion.tsx
    │   │   ├── Alert.tsx
    │   │   ├── Skeleton.tsx
    │   │   ├── Separator.tsx
    │   │   ├── Sheet.tsx
    │   │   ├── Dialog.tsx
    │   │   ├── Calendar.tsx
    │   │   ├── TimePicker.tsx
    │   │   ├── Combobox.tsx
    │   │   ├── Command.tsx
    │   │   ├── Popover.tsx
    │   │   ├── HoverCard.tsx
    │   │   ├── ContextMenu.tsx
    │   │   ├── Menubar.tsx
    │   │   ├── NavigationMenu.tsx
    │   │   ├── Collapsible.tsx
    │   │   ├── Resizable.tsx
    │   │   ├── ScrollArea.tsx
    │   │   ├── RIDSRLogo.tsx
    │   │   └── LanguageSwitcher.tsx
    │   ├── forms/
    │   │   ├── CaseReportForm.tsx
    │   │   ├── PatientSearchForm.tsx
    │   │   ├── UserManagementForm.tsx
    │   │   ├── FacilityManagementForm.tsx
    │   │   ├── LoginForm.tsx
    │   │   ├── ValidationForm.tsx
    │   │   ├── AlertForm.tsx
    │   │   ├── ReportFilterForm.tsx
    │   │   └── ProfileForm.tsx
    │   ├── dashboard/
    │   │   ├── FacilityDashboard.tsx
    │   │   ├── DistrictDashboard.tsx
    │   │   ├── NationalDashboard.tsx
    │   │   ├── CaseStatistics.tsx
    │   │   ├── AlertOverview.tsx
    │   │   ├── TrendVisualization.tsx
    │   │   ├── GeographicMap.tsx
    │   │   ├── EpiCurve.tsx
    │   │   ├── OutbreakDetection.tsx
    │   │   └── PerformanceMetrics.tsx
    │   ├── search/
    │   │   ├── PatientSearch.tsx
    │   │   ├── CaseSearch.tsx
    │   │   ├── FacilitySearch.tsx
    │   │   ├── UserSearch.tsx
    │   │   └── GlobalSearch.tsx
    │   └── validation/
    │       ├── ValidationQueue.tsx
    │       ├── CaseValidator.tsx
    │       ├── LabResultEntry.tsx
    │       └── ValidationHistory.tsx
    ├── features/
    │   ├── auth/
    │   │   ├── components/
    │   │   │   ├── SigninForm.tsx
    │   │   │   └── ForgotPasswordForm.tsx
    │   │   ├── hooks/
    │   │   │   └── useSignin.ts
    │   │   └── types/
    │   │       └── auth.types.ts
    │   ├── dashboard/
    │   │   ├── components/
    │   │   │   ├── DashboardHeader.tsx
    │   │   │   ├── MetricCard.tsx
    │   │   │   ├── RecentActivity.tsx
    │   │   │   └── QuickActions.tsx
    │   │   ├── hooks/
    │   │   │   └── useDashboardData.ts
    │   │   └── types/
    │   │       └── dashboard.types.ts
    │   ├── cases/
    │   │   ├── components/
    │   │   │   ├── CaseList.tsx
    │   │   │   ├── CaseCard.tsx
    │   │   │   ├── CaseDetail.tsx
    │   │   │   ├── CaseFilter.tsx
    │   │   │   └── CaseStatusIndicator.tsx
    │   │   ├── hooks/
    │   │   │   ├── useCases.ts
    │   │   │   └── useCaseDetails.ts
    │   │   └── types/
    │   │       └── case.types.ts
    │   ├── patients/
    │   │   ├── components/
    │   │   │   ├── PatientList.tsx
    │   │   │   ├── PatientCard.tsx
    │   │   │   ├── PatientDetail.tsx
    │   │   │   └── PatientSearch.tsx
    │   │   ├── hooks/
    │   │   │   ├── usePatients.ts
    │   │   │   └── usePatientDetails.ts
    │   │   └── types/
    │   │       └── patient.types.ts
    │   ├── facilities/
    │   │   ├── components/
    │   │   │   ├── FacilityList.tsx
    │   │   │   ├── FacilityCard.tsx
    │   │   │   ├── FacilityDetail.tsx
    │   │   │   └── FacilitySelector.tsx
    │   │   ├── hooks/
    │   │   │   ├── useFacilities.ts
    │   │   │   └── useFacilityDetails.ts
    │   │   └── types/
    │   │       └── facility.types.ts
    │   ├── users/
    │   │   ├── components/
    │   │   │   ├── UserList.tsx
    │   │   │   ├── UserCard.tsx
    │   │   │   ├── UserDetail.tsx
    │   │   │   └── UserSelector.tsx
    │   │   ├── hooks/
    │   │   │   ├── useUsers.ts
    │   │   │   └── useUserDetails.ts
    │   │   └── types/
    │   │       └── user.types.ts
    │   ├── validation/
    │   │   ├── components/
    │   │   │   ├── ValidationQueueList.tsx
    │   │   │   ├── ValidationCard.tsx
    │   │   │   ├── ValidationResult.tsx
    │   │   │   └── ValidationStats.tsx
    │   │   ├── hooks/
    │   │   │   ├── useValidationQueue.ts
    │   │   │   └── useValidationDetails.ts
    │   │   └── types/
    │   │       └── validation.types.ts
    │   ├── alerts/
    │   │   ├── components/
    │   │   │   ├── AlertList.tsx
    │   │   │   ├── AlertCard.tsx
    │   │   │   ├── AlertDetail.tsx
    │   │   │   └── AlertFilter.tsx
    │   │   ├── hooks/
    │   │   │   ├── useAlerts.ts
    │   │   │   └── useAlertDetails.ts
    │   │   └── types/
    │   │       └── alert.types.ts
    │   ├── reports/
    │   │   ├── components/
    │   │   │   ├── ReportList.tsx
    │   │   │   ├── ReportCard.tsx
    │   │   │   ├── ReportGenerator.tsx
    │   │   │   └── ReportViewer.tsx
    │   │   ├── hooks/
    │   │   │   ├── useReports.ts
    │   │   │   └── useReportGenerator.ts
    │   │   └── types/
    │   │       └── report.types.ts
    │   ├── search/
    │   │   ├── components/
    │   │   │   ├── SearchResults.tsx
    │   │   │   ├── SearchResultItem.tsx
    │   │   │   └── SearchFilters.tsx
    │   │   ├── hooks/
    │   │   │   └── useSearch.ts
    │   │   └── types/
    │   │       └── search.types.ts
    │   └── shared/
    │       ├── components/
    │       │   ├── ProtectedRoute.tsx
    │       │   ├── RoleGuard.tsx
    │       │   ├── FacilityGuard.tsx
    │       │   ├── LoadingScreen.tsx
    │       │   ├── ErrorBoundary.tsx
    │       │   ├── ConfirmationDialog.tsx
    │       │   ├── DataTable.tsx
    │       │   ├── ExportButton.tsx
    │       │   ├── ImportButton.tsx
    │       │   ├── PrintButton.tsx
    │       │   ├── ShareButton.tsx
    │       │   ├── HelpTooltip.tsx
    │       │   ├── LanguageSelector.tsx
    │       │   ├── ThemeToggle.tsx
    │       │   ├── NotificationBell.tsx
    │       │   └── UserAvatar.tsx
    │       ├── hooks/
    │       │   ├── useAuth.ts
    │       │   ├── usePermissions.ts
    │       │   ├── useFacilityAccess.ts
    │       │   ├── useDebounce.ts
    │       │   ├── useLocalStorage.ts
    │       │   ├── useSessionTimeout.ts
    │       │   ├── useOnlineStatus.ts
    │       │   ├── usePagination.ts
    │       │   ├── useSort.ts
    │       │   ├── useFilter.ts
    │       │   ├── useExport.ts
    │       │   ├── useImport.ts
    │       │   ├── useFormValidation.ts
    │       │   ├── useApi.ts
    │       │   ├── useAsync.ts
    │       │   ├── usePrevious.ts
    │       │   ├── useClickOutside.ts
    │       │   ├── useKeyPress.ts
    │       │   ├── useIntersectionObserver.ts
    │       │   ├── useResizeObserver.ts
    │       │   ├── useMediaQuery.ts
    │       │   ├── useCopyToClipboard.ts
    │       │   ├── useDownload.ts
    │       │   ├── useFullscreen.ts
    │       │   ├── useIdleTimer.ts
    │       │   ├── useNetworkStatus.ts
    │       │   ├── useOrientation.ts
    │       │   ├── useScrollPosition.ts
    │       │   ├── useSwipe.ts
    │       │   ├── useThrottle.ts
    │       │   ├── useTitle.ts
    │       │   ├── useToggle.ts
    │       │   ├── useWindowDimensions.ts
    │       │   └── useZoom.ts
    │       └── types/
    │           ├── api.types.ts
    │           ├── common.types.ts
    │           ├── permissions.types.ts
    │           └── validation.types.ts
    ├── data/
    │   ├── constants/
    │   │   ├── roles.constants.ts
    │   │   ├── permissions.constants.ts
    │   │   ├── facility-types.constants.ts
    │   │   ├── disease-codes.constants.ts
    │   │   ├── validation-status.constants.ts
    │   │   ├── case-status.constants.ts
    │   │   ├── alert-types.constants.ts
    │   │   ├── report-types.constants.ts
    │   │   ├── countries.constants.ts
    │   │   ├── provinces.constants.ts
    │   │   ├── districts.constants.ts
    │   │   ├── sectors.constants.ts
    │   │   ├── languages.constants.ts
    │   │   └── themes.constants.ts
    │   ├── static/
    │   │   ├── sample-data.json
    │   │   ├── disease-classifications.json
    │   │   ├── facility-list.json
    │   │   └── user-templates.json
    │   └── content/
    │       ├── faq-content.json
    │       ├── about-content.json
    │       ├── privacy-policy-content.json
    │       └── academy-content.json
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useUser.ts
    │   ├── useFacility.ts
    │   ├── usePermissions.ts
    │   ├── useCases.ts
    │   ├── usePatients.ts
    │   ├── useValidation.ts
    │   ├── useAlerts.ts
    │   ├── useReports.ts
    │   ├── useSearch.ts
    │   ├── useNotifications.ts
    │   └── useTheme.ts
    ├── lib/
    │   ├── config/
    │   │   ├── auth.config.ts
    │   │   ├── api.config.ts
    │   │   ├── database.config.ts
    │   │   ├── validation.config.ts
    │   │   ├── permissions.config.ts
    │   │   ├── routes.config.ts
    │   │   ├── themes.config.ts
    │   │   └── languages.config.ts
    │   ├── utils/
    │   │   ├── auth.utils.ts
    │   │   ├── date.utils.ts
    │   │   ├── string.utils.ts
    │   │   ├── number.utils.ts
    │   │   ├── object.utils.ts
    │   │   ├── array.utils.ts
    │   │   ├── validation.utils.ts
    │   │   ├── permissions.utils.ts
    │   │   ├── facility.utils.ts
    │   │   ├── case.utils.ts
    │   │   ├── patient.utils.ts
    │   │   ├── validation.utils.ts
    │   │   ├── report.utils.ts
    │   │   ├── alert.utils.ts
    │   │   ├── search.utils.ts
    │   │   ├── export.utils.ts
    │   │   ├── import.utils.ts
    │   │   ├── file.utils.ts
    │   │   ├── crypto.utils.ts
    │   │   ├── geolocation.utils.ts
    │   │   ├── notification.utils.ts
    │   │   ├── theme.utils.ts
    │   │   ├── language.utils.ts
    │   │   ├── url.utils.ts
    │   │   ├── storage.utils.ts
    │   │   ├── cache.utils.ts
    │   │   ├── error.utils.ts
    │   │   ├── logger.utils.ts
    │   │   ├── test.utils.ts
    │   │   └── helpers.utils.ts
    │   ├── services/
    │   │   ├── auth.service.ts
    │   │   ├── user.service.ts
    │   │   ├── facility.service.ts
    │   │   ├── case.service.ts
    │   │   ├── patient.service.ts
    │   │   ├── validation.service.ts
    │   │   ├── alert.service.ts
    │   │   ├── report.service.ts
    │   │   ├── search.service.ts
    │   │   ├── notification.service.ts
    │   │   ├── export.service.ts
    │   │   ├── import.service.ts
    │   │   ├── file.service.ts
    │   │   ├── geolocation.service.ts
    │   │   ├── email.service.ts
    │   │   ├── sms.service.ts
    │   │   ├── cache.service.ts
    │   │   ├── queue.service.ts
    │   │   ├── audit.service.ts
    │   │   ├── backup.service.ts
    │   │   └── monitoring.service.ts
    │   └── middleware/
    │       ├── auth.middleware.ts
    │       ├── role.middleware.ts
    │       ├── facility.middleware.ts
    │       ├── permission.middleware.ts
    │       ├── audit.middleware.ts
    │       ├── rate-limit.middleware.ts
    │       ├── cors.middleware.ts
    │       ├── security.middleware.ts
    │       ├── logging.middleware.ts
    │       └── validation.middleware.ts
    ├── providers/
    │   ├── session-provider.tsx
    │   ├── theme-provider.tsx
    │   ├── language-provider.tsx
    │   ├── facility-access-provider.tsx
    │   ├── permissions-provider.tsx
    │   ├── notifications-provider.tsx
    │   ├── cache-provider.tsx
    │   └── analytics-provider.tsx
    ├── styles/
    │   ├── globals.css
    │   ├── components.css
    │   ├── utilities.css
    │   ├── themes/
    │   │   ├── light.css
    │   │   ├── dark.css
    │   │   └── high-contrast.css
    │   └── animations.css
    └── types/
        ├── auth.types.ts
        ├── user.types.ts
        ├── facility.types.ts
        ├── case.types.ts
        ├── patient.types.ts
        ├── validation.types.ts
        ├── alert.types.ts
        ├── report.types.ts
        ├── search.types.ts
        ├── permission.types.ts
        ├── api.types.ts
        ├── common.types.ts
        ├── form.types.ts
        ├── ui.types.ts
        ├── dashboard.types.ts
        ├── notification.types.ts
        └── global.types.ts
```

## URL Routing Patterns and Parameter Usage

### Authentication Routes
- `GET /signin` - User sign-in page (worker ID and password)
- `POST /api/auth/signin` - Authentication API endpoint
- `GET /api/auth/me` - Get current user info

### Dashboard Routes (Role-Based)
- `GET /dashboard` - Redirects to role-specific dashboard
- `GET /dashboard/facility/[id]` - Facility-specific dashboard for health workers and facility admins
- `GET /dashboard/district/[id]` - District-specific dashboard for district officers
- `GET /dashboard/national` - National dashboard for national officers and system admins

### Case Reporting Routes
- `GET /report-case` - Main case reporting form
- `GET /report-case/search-patient` - Patient search interface
- `GET /report-case/[diseaseCode]` - Disease-specific case reporting form
- `GET /cases` - List of cases (filtered by facility/district access)
- `GET /cases/[id]` - Specific case detail view
- `GET /cases/[id]/edit` - Edit specific case (for authorized users)
- `GET /cases/facility/[facilityId]` - Cases for specific facility

### Validation Routes
- `GET /validation` - Validation dashboard for lab technicians
- `GET /validation/queue` - Validation queue list
- `GET /validation/[caseId]` - Specific case validation interface
- `POST /api/validation/[caseId]` - Submit validation result

### Patient Management Routes
- `GET /patients` - List of patients (filtered by facility access)
- `GET /patients/search` - Advanced patient search
- `GET /patients/[id]` - Patient detail view
- `GET /patients/[id]/edit` - Edit patient information

### User Management Routes (Facility Admin Only)
- `GET /users` - List of users (filtered by facility access)
- `GET /users/create` - Create new user for facility
- `GET /users/[id]` - User detail view
- `GET /users/[id]/edit` - Edit user information
- `POST /api/users` - Create user API endpoint
- `PUT /api/users/[id]` - Update user API endpoint

### Facility Management Routes (Admin Only)
- `GET /facilities` - List of all facilities
- `GET /facilities/[id]` - Facility detail view
- `GET /facilities/[id]/edit` - Edit facility information
- `POST /api/facilities` - Create facility API endpoint

### Alert Management Routes
- `GET /alerts` - List of alerts (filtered by role access)
- `GET /alerts/[id]` - Specific alert detail view
- `GET /alerts/[id]/resolve` - Resolve specific alert
- `POST /api/alerts/[id]/resolve` - Resolve alert API endpoint

### Report Generation Routes
- `GET /reports` - List of available reports
- `GET /reports/[type]` - Specific report type view
- `GET /reports/generate` - Report generation interface
- `POST /api/reports/generate` - Generate report API endpoint

### Search Routes
- `GET /api/search` - Global search API endpoint
- `GET /api/search/patients` - Patient search API endpoint
- `GET /api/search/cases` - Case search API endpoint
- `GET /api/search/users` - User search API endpoint
- `GET /api/search/facilities` - Facility search API endpoint

### Administrative Routes (System Admin Only)
- `GET /admin` - Main admin dashboard
- `GET /admin/users` - User management for all facilities
- `GET /admin/users/create` - Create user for any facility
- `GET /admin/facilities` - Facility management
- `GET /admin/facilities/create` - Create new facility
- `GET /admin/reports/global` - Global reports
- `GET /admin/system` - System configuration
- `GET /admin/system/settings` - System settings

## Layout Structure

### Root Layout (`/src/app/layout.tsx`)
- Wraps entire application
- Sets up theme provider, language provider, and session provider
- Includes global styles and metadata

### Authentication Layout (`/src/app/(auth)/layout.tsx`)
- Minimal layout for authentication pages
- No navigation or sidebar
- Centered authentication forms

### Main Layout (`/src/app/(main)/layout.tsx`)
- Contains main navigation (navbar and sidebar)
- Applies to all authenticated user routes
- Includes user profile dropdown and notifications

### Dashboard Layout (`/src/app/(main)/dashboard/layout.tsx`)
- Specialized layout for dashboard pages
- Includes quick action buttons and metric cards
- Role-specific navigation options

### Admin Layout (`/src/app/(admin)/layout.tsx`)
- Layout for administrative sections
- Includes admin-specific navigation
- Enhanced security and access controls

## Key Features of the URL Structure

1. **Role-Based Access Control**: URLs automatically filter content based on user role and facility access
2. **Parameterized Routes**: Extensive use of dynamic routes with [id] and [param] patterns
3. **Nested Routing**: Complex nested routes for detailed views and actions
4. **API Endpoints**: Corresponding API routes for all data operations
5. **Search Integration**: Comprehensive search functionality across entities
6. **Facility Isolation**: Facility-specific routes ensure data isolation
7. **Validation Workflows**: Dedicated routes for case validation processes
8. **Report Generation**: Specialized routes for different report types

This structure ensures that the RIDSR platform maintains strict data isolation between facilities while providing role-appropriate access to information and functionality, as specified in the BUSINESS_LOGIC.md documentation.