# RIDSR MongoDB Database Schema

> Rwanda Integrated Disease Surveillance and Response Platform - Database Documentation

---

## Collections Overview

| Collection | Description | Document Count |
|------------|-------------|----------------|
| `users` | System users (health workers, admins, etc.) | - |
| `patients` | Patient demographic data | - |
| `cases` | Disease case reports | - |
| `facilities` | Health facilities | - |
| `alertresolutions` | Outbreak alert resolutions | - |

---

## Entity Relationship Diagram

```dbdiagram
Table users {
  _id ObjectId [pk]
  workerId string [unique, not null]
  nationalId string [unique, not null]
  name string [not null]
  email string [unique, not null]
  phone string [not null]
  password string [not null, note: "argon2 hash"]
  role string [not null, note: "admin|national_officer|district_officer|health_worker|lab_technician"]
  facilityId ObjectId [ref: > facilities._id]
  facilityName string
  district string
  province string
  isActive boolean [default: true]
  createdAt datetime
  updatedAt datetime
}

Table patients {
  _id ObjectId [pk]
  nationalId string [unique, not null]
  firstName string [not null]
  lastName string [not null]
  dateOfBirth date [not null]
  gender string [not null, note: "male|female|other"]
  phone string [not null]
  address.street string
  address.sector string
  address.district string
  address.province string
  address.country string [default: "Rwanda"]
  district string [not null]
  occupation string
  emergencyContact.name string
  emergencyContact.phone string
  emergencyContact.relationship string
  createdAt datetime
  updatedAt datetime
}

Table facilities {
  _id ObjectId [pk]
  name string [not null]
  code string [unique, not null, note: "e.g., HC00055"]
  type string [not null]
  district string [not null]
  province string [not null]
  contactPerson string
  phone string
  email string
  isActive boolean [default: true]
  createdAt datetime
  updatedAt datetime
}

Table cases {
  _id ObjectId [pk]
  patientId ObjectId [not null, ref: > patients._id]
  facilityId ObjectId [not null, ref: > facilities._id]
  diseaseCode string [not null]
  symptoms array<string> [note: "e.g., fever, cough, headache"]
  onsetDate date [not null]
  reportDate date [not null]
  reporterId ObjectId [not null, ref: > users._id]
  validationStatus string [default: "pending", note: "pending|validated|rejected"]
  status string [default: "suspected", note: "suspected|confirmed|resolved|invalidated"]
  outcome string [note: "recovered|deceased|transferred|unknown"]
  validatorId ObjectId [ref: > users._id]
  validationDate datetime
  outcomeDate datetime
  createdAt datetime
  updatedAt datetime
}

Table lab_results {
  _id ObjectId [pk]
  caseId ObjectId [ref: > cases._id, note: "embedded in cases collection"]
  testType string [not null]
  testName string [not null]
  testDate date [not null]
  resultValue string [not null]
  interpretation string [not null, note: "positive|negative|equivocal|contaminated"]
  resultUnit string
  referenceRange string
  technicianId ObjectId [not null, ref: > users._id]
  validatedBy ObjectId [ref: > users._id]
  validatedAt datetime
  createdAt datetime
  updatedAt datetime
}

Table alertresolutions {
  _id ObjectId [pk]
  alertId string [not null, index]
  signature string [not null]
  district string [not null, index]
  severity string [not null, note: "low|medium|high|critical"]
  title string [not null]
  description string [not null]
  triggerDate date [not null]
  resolvedBy string
  resolvedAt date [not null]
  createdAt datetime
  updatedAt datetime
}

// Relationships
users -o facilities : belongs to
cases >o patients : for
cases >o facilities : at
cases >o users : reported by
cases >o users : validated by
lab_results >o cases : embedded in
lab_results >o users : tested by
lab_results >o users : validated by
alertresolutions : [compound index: alertId + signature]
```

---

## Detailed Schema Documentation

### 1. Users Collection

**Collection Name:** `users`

**Purpose:** Stores system users with role-based access control.

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | - | - | - | Auto-generated primary key |
| `workerId` | String | Yes | Yes | - | Unique worker identifier |
| `nationalId` | String | Yes | Yes | - | Rwanda national ID |
| `name` | String | Yes | - | - | Full name |
| `email` | String | Yes | Yes | - | Email address |
| `phone` | String | Yes | - | - | Phone number |
| `password` | String | Yes | - | - | Argon2 hashed password |
| `role` | String | Yes | - | - | User role (enum) |
| `facilityId` | ObjectId | No | - | - | Reference to Facility |
| `facilityName` | String | No | - | - | Denormalized facility name |
| `district` | String | No | - | - | Rwanda district |
| `province` | String | No | - | - | Rwanda province |
| `isActive` | Boolean | - | - | `true` | Account active status |
| `createdAt` | Date | - | - | Auto | Creation timestamp |
| `updatedAt` | Date | - | - | Auto | Last update timestamp |

**Roles Enum:**
- `admin` - System administrator
- `national_officer` - National level officer
- `district_officer` - District level officer
- `health_worker` - Health facility worker
- `lab_technician` - Laboratory technician

**Indexes:**
- `workerId` (unique)
- `nationalId` (unique)
- `email` (unique)

---

### 2. Patients Collection

**Collection Name:** `patients`

**Purpose:** Stores patient demographic information.

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | - | - | - | Auto-generated primary key |
| `nationalId` | String | Yes | Yes | - | Rwanda national ID |
| `firstName` | String | Yes | - | - | Patient first name |
| `lastName` | String | Yes | - | - | Patient last name |
| `dateOfBirth` | Date | Yes | - | - | Date of birth |
| `gender` | String | Yes | - | - | `male`, `female`, `other` |
| `phone` | String | Yes | - | - | Contact phone number |
| `address.street` | String | No | - | - | Street address |
| `address.sector` | String | No | - | - | Sector (administrative) |
| `address.district` | String | No | - | - | District |
| `address.province` | String | No | - | - | Province |
| `address.country` | String | No | - | `"Rwanda"` | Country |
| `district` | String | Yes | - | - | Primary district |
| `occupation` | String | No | - | - | Patient occupation |
| `emergencyContact.name` | String | No | - | - | Emergency contact name |
| `emergencyContact.phone` | String | No | - | - | Emergency contact phone |
| `emergencyContact.relationship` | String | No | - | - | Relationship to patient |
| `createdAt` | Date | - | - | Auto | Creation timestamp |
| `updatedAt` | Date | - | - | Auto | Last update timestamp |

**Indexes:**
- `nationalId` (unique)

---

### 3. Facilities Collection

**Collection Name:** `facilities`

**Purpose:** Stores health facility information.

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | - | - | - | Auto-generated primary key |
| `name` | String | Yes | - | - | Facility name |
| `code` | String | Yes | Yes | - | Facility code (e.g., HC00055) |
| `type` | String | Yes | - | - | Facility type |
| `district` | String | Yes | - | - | District location |
| `province` | String | Yes | - | - | Province location |
| `contactPerson` | String | No | - | - | Primary contact name |
| `phone` | String | No | - | - | Contact phone |
| `email` | String | No | - | - | Contact email |
| `isActive` | Boolean | - | - | `true` | Facility active status |
| `createdAt` | Date | - | - | Auto | Creation timestamp |
| `updatedAt` | Date | - | - | Auto | Last update timestamp |

**Indexes:**
- `code` (unique)

---

### 4. Cases Collection

**Collection Name:** `cases`

**Purpose:** Stores disease case reports and surveillance data.

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | - | - | - | Auto-generated primary key |
| `patientId` | ObjectId | Yes | - | - | Reference to Patient |
| `facilityId` | ObjectId | Yes | - | - | Reference to Facility |
| `diseaseCode` | String | Yes | - | - | Disease identifier code |
| `symptoms` | Array<String> | - | - | `[]` | List of symptoms |
| `onsetDate` | Date | Yes | - | - | Symptom onset date |
| `reportDate` | Date | Yes | - | - | Case report date |
| `reporterId` | ObjectId | Yes | - | - | Reference to User (reporter) |
| `validationStatus` | String | - | - | `"pending"` | `pending`, `validated`, `rejected` |
| `status` | String | - | - | `"suspected"` | `suspected`, `confirmed`, `resolved`, `invalidated` |
| `outcome` | String | No | - | - | `recovered`, `deceased`, `transferred`, `unknown` |
| `validatorId` | ObjectId | No | - | - | Reference to User (validator) |
| `validationDate` | Date | No | - | - | Validation timestamp |
| `outcomeDate` | Date | No | - | - | Outcome recorded date |
| `labResults` | Array | - | - | `[]` | Embedded lab results |
| `createdAt` | Date | - | - | Auto | Creation timestamp |
| `updatedAt` | Date | - | - | Auto | Last update timestamp |

#### 4.1 Lab Results (Embedded Subdocument)

Embedded within `cases.labResults[]`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | Subdocument ID |
| `testType` | String | Yes | Type of test performed |
| `testName` | String | Yes | Specific test name |
| `testDate` | Date | Yes | Date test was performed |
| `resultValue` | String | Yes | Test result value |
| `interpretation` | String | Yes | `positive`, `negative`, `equivocal`, `contaminated` |
| `resultUnit` | String | No | Unit of measurement |
| `referenceRange` | String | No | Normal reference range |
| `technicianId` | ObjectId | Yes | Ref to User (lab technician) |
| `validatedBy` | ObjectId | No | Ref to User (validator) |
| `validatedAt` | Date | No | Validation timestamp |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:**
- `patientId` (reference)
- `facilityId` (reference)
- `reporterId` (reference)
- `diseaseCode` (for queries)
- `status` (for filtering)
- `validationStatus` (for filtering)

---

### 5. Alert Resolutions Collection

**Collection Name:** `alertresolutions`

**Purpose:** Tracks outbreak alert resolutions.

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | - | - | - | Auto-generated primary key |
| `alertId` | String | Yes | - | - | Alert identifier (indexed) |
| `signature` | String | Yes | - | - | Unique signature |
| `district` | String | Yes | - | - | District (indexed) |
| `severity` | String | Yes | - | - | `low`, `medium`, `high`, `critical` |
| `title` | String | Yes | - | - | Alert title |
| `description` | String | Yes | - | - | Detailed description |
| `triggerDate` | Date | Yes | - | - | Date alert was triggered |
| `resolvedBy` | String | No | - | - | Resolver identifier |
| `resolvedAt` | Date | Yes | - | Auto | Resolution timestamp |
| `createdAt` | Date | - | - | Auto | Creation timestamp |
| `updatedAt` | Date | - | - | Auto | Last update timestamp |

**Indexes:**
- `alertId` (ascending)
- `district` (ascending)
- `{alertId: 1, signature: 1}` (compound unique)

---

## Relationships Diagram (Text)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  facilities │       │  patients   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ _id (PK)    │       │ _id (PK)    │       │ _id (PK)    │
│ workerId    │◄──────│ name        │◄──────│ nationalId  │
│ nationalId  │       │ code        │       │ firstName   │
│ name        │       │ type        │       │ lastName    │
│ email       │       │ district    │       │ gender      │
│ role        │       │ province    │       │ district    │
│ facilityId  │──┐    │ isActive    │       │ address     │
│ district    │  │    └─────────────┘       └──────┬──────┘
│ province    │  │                                 │
└──────┬──────┘  │    ┌─────────────────────────┐  │
       │         │    │         cases           │  │
       │         │    ├─────────────────────────┤  │
       │         │    │ _id (PK)                │  │
       │         ├───►│ reporterId (ref: User)  │  │
       │         │    │ validatorId (ref: User) │  │
       │         │    │ patientId (ref: Patient)│◄─┘
       │         │    │ facilityId (ref: Facil.)│◄─┐
       │         │    │ diseaseCode             │  │
       │         │    │ symptoms[]              │  │
       │         │    │ status                  │  │
       │         │    │ validationStatus        │  │
       │         │    │ labResults[] ───────────┼──┼────┐
       │         │    └─────────────────────────┘  │    │
       │         │                                 │    │
       │         │    ┌─────────────────────────┐  │    │
       │         │    │  alertresolutions       │  │    │
       │         │    ├─────────────────────────┤  │    │
       │         │    │ _id (PK)                │  │    │
       │         │    │ alertId                 │  │    │
       │         │    │ district                │  │    │
       │         │    │ severity                │  │    │
       │         │    │ (alertId, signature)    │  │    │
       │         │    │   [compound unique]     │  │    │
       │         │    └─────────────────────────┘  │    │
       │         │                                 │    │
       │         │    labResults:                 │    │
       │         │    ┌─────────────────────────┐  │    │
       │         └───►│ technicianId (ref: User)│◄─┼────┘
       │              │ validatedBy (ref: User) │  │
       │              │ testType, testName      │  │
       │              │ interpretation          │  │
       │              └─────────────────────────┘  │
       │                                           │
       └───────────────────────────────────────────┘
                    (denormalized facilityName)
```

---

## Common Queries

### Get all cases for a district
```javascript
db.cases.find({ 
  "status": { $in: ["suspected", "confirmed"] }
}).populate('patientId').populate('facilityId')
```

### Get lab results for a case
```javascript
db.cases.findOne(
  { _id: ObjectId("case_id") },
  { labResults: 1 }
)
```

### Count cases by disease
```javascript
db.cases.aggregate([
  { $group: { _id: "$diseaseCode", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### Get active users by district
```javascript
db.users.find({
  district: "gasabo",
  isActive: true
})
```

---

## Data Migration Notes

- **Password Hashing:** Migrated from bcryptjs to argon2 (March 2026)
- **Lab Results:** Embedded subdocument in cases collection (denormalized for query performance)
- **Facility Name:** Denormalized in users collection for performance
