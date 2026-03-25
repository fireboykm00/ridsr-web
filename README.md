# RIDSR — Rwanda National Integrated Disease Surveillance and Response

A unified digital platform enabling real-time disease monitoring, rapid outbreak response, and data-driven public health decisions across all 30 districts of Rwanda.

---

## Overview

RIDSR is a government-grade web application built for the Rwanda Ministry of Health and the Rwanda Biomedical Centre (RBC). It connects health facilities nationwide into a single surveillance network, allowing health workers, district officers, and national coordinators to report, validate, track, and respond to notifiable disease cases in real time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4, custom RBC design system |
| Database | MongoDB Atlas, Mongoose 9 |
| Authentication | NextAuth 5 (JWT, credentials provider) |
| Validation | Zod 4 |
| Charts | Recharts |
| PDF Reports | jsPDF + jspdf-autotable |
| Real-time | Socket.io |

---

## Architecture

```
src/
├── app/
│   ├── (home)/          # Public pages (about, faq, terms) — Navbar + Footer layout
│   ├── (main)/          # Authenticated area
│   │   ├── dashboard/   # Dashboard views (national, district, facility)
│   │   ├── login/       # Auth page
│   │   └── auth/        # Auth error handling
│   └── api/             # REST API routes
│       ├── auth/        # NextAuth handler
│       ├── cases/       # CRUD + validation + lab results
│       ├── patients/    # Patient management
│       ├── facilities/  # Facility management
│       ├── users/       # User management
│       ├── dashboard/   # Statistics endpoints
│       ├── validation/  # Validation queue
│       ├── alerts/      # Alert system
│       └── reports/     # Report generation
├── components/
│   ├── ui/              # 20 reusable components (Button, Card, Table, Chart, etc.)
│   ├── layout/          # Navbar, Sidebar, Footer, DashboardClient, Breadcrumb
│   └── dashboard/       # Dashboard-specific components
├── features/
│   └── home/            # Landing page sections (Hero, Features, Partners, CTA)
├── lib/
│   ├── models/          # Mongoose schemas (User, Case, Patient, Facility, Alert)
│   ├── services/        # Client + server-side business logic
│   ├── utils/           # PDF generator, utilities
│   └── db.ts            # MongoDB connection manager
└── types/
    └── index.ts         # All TypeScript types, enums, constants
```

### Route Groups

- **`(home)`** — Public pages with Navbar and Footer. Includes About, FAQ, Terms.
- **`(main)`** — Authenticated area. The `DashboardClient` wraps all dashboard pages with a dark sidebar and breadcrumb header.

---

## User Roles

The platform implements role-based access control with five roles:

| Role | Access Level |
|---|---|
| **Admin** | Full system access. User management, facility management, national dashboards, all reports. |
| **National Officer** | National-level dashboards, all district data, report generation, user/facility oversight. |
| **District Officer** | District-specific dashboards, facility cases within their district, case validation. |
| **Health Worker** | Report cases from their assigned facility, view facility-level data. |
| **Lab Technician** | Report lab results linked to cases, view the lab validation queue. |

### Dashboard Views

Each role sees a tailored dashboard:

- **National Dashboard** — National officers and admins see country-wide case trends, disease distribution, facility coverage, and active alerts.
- **District Dashboard** — District officers see their district's case load, facilities with cases, and weekly trends.
- **Facility Dashboard** — Health workers see their facility's reported cases and pending items.

---

## Core Workflows

### 1. Case Reporting

```
Health Worker → Report Case → Select Patient → Enter Disease + Symptoms + Onset Date → Submit
```

- Cases are created with status `suspected` and validation status `pending`.
- The reporter's user ID is attached to the case as `reporterId`.
- Cases can be submitted offline and synced when connectivity is restored.

### 2. Case Validation

```
District Officer / National Officer → Validation Queue → Review Case Details → Validate or Reject
```

- Pending cases appear in the validation queue.
- Reviewers can view patient info, symptoms, facility details, and lab results.
- Validation changes the case status to `validated` or `rejected`.

### 3. Lab Results

```
Lab Technician → Select Case → Enter Test Type + Result + Interpretation → Attach to Case
```

- Lab results are subdocuments embedded in the Case model.
- Interpretation values: `positive`, `negative`, `equivocal`, `contaminated`.
- Results feed back into the validation workflow.

### 4. Alert System

```
System / Officer → Trigger Alert → Define Severity + Description → Notify Response Teams
```

- Alert severities: `low`, `medium`, `high`, `critical`.
- Alerts can be filtered by district, severity, and date range.
- Resolution requires a signature and is tracked with timestamps.

### 5. Report Generation

```
National / District Officer → Reports → Select Report Type + Date Range + Filters → Generate PDF
```

- Report types: daily, weekly, monthly, quarterly, annual (facility/district/national level).
- Generated PDFs include case tables, disease breakdowns, and a "Submitted By" column.
- Reports are branded with RBC header and footer.

---

## Design System

The UI follows the Rwanda Biomedical Centre institutional design standards:

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#005DAA` | Buttons, links, headings, branding |
| `--accent` | `#FFD200` | CTA buttons, alerts, badges |
| `--background` | `#FFFFFF` | Page canvas |
| `--muted` | `#F5F7FA` | Section backgrounds |
| `--border` | `#E5E7EB` | Borders, dividers |
| `--sidebar` | `#032F3D` | Dark sidebar and footer |
| `--destructive` | `#DC2626` | Error states, delete actions |

### Design Principles

- No shadows, no gradients, no glass effects
- `rounded-md` border radius throughout
- All colors via CSS custom properties (no hardcoded Tailwind colors)
- `rwanda-pattern.svg` imigongo-inspired geometric pattern as section backgrounds
- Inter font family, institutional spacing

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Environment Setup

Create a `.env.local` file:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ridsr?retryWrites=true&w=majority
MONGODB_DB=ridsr

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RIDSR
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Seed Demo Data

The platform ships with a demo admin account:

```
Email:    admin@ridsr.rw
Password: Hello123
```

---

## API Routes

| Endpoint | Methods | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth authentication |
| `/api/cases` | GET, POST | List/create cases |
| `/api/cases/[id]` | GET, PUT, DELETE | Case CRUD |
| `/api/cases/validate/[id]` | PUT | Validate or reject a case |
| `/api/cases/[id]/lab-results` | GET, POST | Case lab results |
| `/api/patients` | GET, POST | List/create patients |
| `/api/patients/[id]` | GET, PUT, DELETE | Patient CRUD |
| `/api/facilities` | GET, POST | List/create facilities |
| `/api/facilities/[id]` | GET, PUT, DELETE | Facility CRUD |
| `/api/users` | GET, POST | List/create users |
| `/api/users/[id]` | GET, PUT, DELETE | User CRUD |
| `/api/dashboard` | GET | Dashboard statistics |
| `/api/validation/queue` | GET | Pending validation queue |
| `/api/alerts` | GET, POST | List/create alerts |
| `/api/reports/cases` | POST | Generate PDF reports |

All API routes (except auth) require authentication via NextAuth JWT.

---

## Disease Surveillance Codes

The platform tracks 13 notifiable diseases:

| Code | Disease |
|---|---|
| `CHOLERA` | Cholera |
| `MAL01` | Malaria |
| `SARI` | Severe Acute Respiratory Illness |
| `AFP` | Acute Flaccid Paralysis |
| `YELLOW_FEVER` | Yellow Fever |
| `RUBELLA` | Rubella |
| `MEASLES` | Measles |
| `PLAGUE` | Plague |
| `RABIES` | Rabies |
| `EBOLA` | Ebola Virus Disease |
| `MONKEYPOX` | Monkeypox |
| `TYPHOID` | Typhoid Fever |
| `HEPATITIS_E` | Hepatitis E |

---

## Coverage

The platform covers all 30 districts of Rwanda across 5 provinces:

- **City of Kigali (3):** Gasabo, Kicukiro, Nyarugenge
- **Northern (5):** Burera, Gakenke, Gicumbi, Musanze, Rulindo
- **Southern (8):** Gisagara, Huye, Kamonyi, Muhanga, Nyamagabe, Nyanza, Nyaruguru, Ruhango
- **Eastern (7):** Bugesera, Gatsibo, Kayonza, Kirehe, Ngoma, Nyagatare, Rwamagana
- **Western (7):** Karongi, Ngororero, Nyabihu, Nyamasheke, Rubavu, Rusizi, Rutsiro

---

## License

© 2026 Rwanda National Integrated Disease Surveillance and Response Platform. All rights reserved.
