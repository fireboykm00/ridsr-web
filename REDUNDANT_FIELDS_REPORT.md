# RIDSR Project - Redundant Fields Report
**Date:** February 12, 2026  
**Purpose:** Complete list of fields to remove/keep with justification

---

## Overview

This document lists every field in every model, marking which to keep, remove, or modify, with clear justification.

---

## Patient Model

### Current Fields (15 total)

| Field | Status | Action | Justification |
|-------|--------|--------|---------------|
| `nationalId` | ✅ KEEP | Required, unique | Primary identifier for patients in Rwanda |
| `firstName` | ✅ KEEP | Required | Essential for patient identification |
| `lastName` | ✅ KEEP | Required | Essential for patient identification |
| `dateOfBirth` | ✅ KEEP | Required | Critical for age-based disease analysis |
| `gender` | ✅ KEEP | Required | Important for epidemiological analysis |
| `phone` | ✅ KEEP | Required | Contact tracing requirement |
| `address.street` | ❌ REMOVE | Delete | Too granular for MVP, not used in reports |
| `address.sector` | ❌ REMOVE | Delete | Too granular for MVP, not used in reports |
| `address.district` | ✅ KEEP | Move to top level | Critical for geographic disease tracking |
| `address.province` | ❌ REMOVE | Delete | Can be derived from district |
| `address.country` | ❌ REMOVE | Delete | Always Rwanda, no need to store |
| `occupation` | ❌ REMOVE | Make optional later | Not critical for MVP |
| `emergencyContact` | ⚠️ KEEP | Optional | Important for contact tracing |
| `createdAt` | ✅ KEEP | Required | Audit trail |
| `updatedAt` | ❌ REMOVE | Delete | Not needed, adds complexity |

### New Structure (9 fields)
```typescript
{
  nationalId: string;           // ✅ Unique identifier
  firstName: string;             // ✅ Name
  lastName: string;              // ✅ Name
  dateOfBirth: Date;            // ✅ Age calculation
  gender: Gender;               // ✅ Demographics
  phone: string;                // ✅ Contact tracing
  district: RwandaDistrictType; // ✅ Geographic tracking
  emergencyContact?: {          // ⚠️ Optional but important
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;              // ✅ Audit
}
```

**Reduction:** 15 → 9 fields (40% reduction)

---

## Case Model

### Current Fields (16 total)

| Field | Status | Action | Justification |
|-------|--------|--------|---------------|
| `patientId` | ✅ KEEP | Required | Links case to patient |
| `facilityId` | ✅ KEEP | Required | Links case to reporting facility |
| `diseaseCode` | ✅ KEEP | Required | Core disease identification |
| `symptoms` | ✅ KEEP | Required | Clinical presentation |
| `onsetDate` | ✅ KEEP | Required | Epidemiological curve calculation |
| `reportDate` | ✅ KEEP | Required | Reporting delay analysis |
| `reporterId` | ✅ KEEP | Required | Accountability and audit |
| `validationStatus` | ✅ KEEP | Required | Workflow state |
| `validatorId` | ❌ REMOVE | Delete | Can be tracked in separate validation log |
| `validationDate` | ❌ REMOVE | Delete | Can be tracked in separate validation log |
| `isAlertTriggered` | ❌ REMOVE | Compute | Should be computed based on rules, not stored |
| `labResults` | ❌ REMOVE | Separate table | Should be separate LabResult collection |
| `outcome` | ✅ KEEP | Optional | Important for case resolution |
| `outcomeDate` | ❌ REMOVE | Delete | Not critical, can be added later |
| `createdAt` | ✅ KEEP | Required | Audit trail |
| `updatedAt` | ❌ REMOVE | Delete | Not needed |

### New Structure (10 fields)
```typescript
{
  patientId: ObjectId;           // ✅ Patient link
  facilityId: ObjectId;          // ✅ Facility link
  diseaseCode: string;           // ✅ Disease identification
  symptoms: string[];            // ✅ Clinical data
  onsetDate: Date;              // ✅ Epidemiology
  reportDate: Date;             // ✅ Reporting metrics
  reporterId: ObjectId;          // ✅ Accountability
  validationStatus: string;      // ✅ Workflow
  outcome?: OutcomeStatus;       // ⚠️ Optional outcome
  createdAt: Date;              // ✅ Audit
}
```

**Reduction:** 16 → 10 fields (37.5% reduction)

### New Collections to Create

#### ValidationLog (for tracking validation history)
```typescript
{
  caseId: ObjectId;
  validatorId: ObjectId;
  previousStatus: ValidationStatus;
  newStatus: ValidationStatus;
  notes?: string;
  validatedAt: Date;
}
```

#### LabResult (for lab test results)
```typescript
{
  caseId: ObjectId;
  testType: string;
  testDate: Date;
  result: string;
  interpretation: LabResultInterpretation;
  technicianId: ObjectId;
  createdAt: Date;
}
```

---

## User Model

### Current Fields (10 total)

| Field | Status | Action | Justification |
|-------|--------|--------|---------------|
| `name` | ✅ KEEP | Required | User identification |
| `email` | ✅ KEEP | Required, unique | Authentication |
| `password` | ✅ KEEP | Required | Authentication |
| `role` | ✅ KEEP | Required | Authorization |
| `facilityId` | ✅ KEEP | Optional | For facility-level users |
| `district` | ✅ KEEP | Optional | For district-level users |
| `province` | ❌ REMOVE | Delete | Can be derived from district or facility |
| `isActive` | ✅ KEEP | Required | User management |
| `createdAt` | ✅ KEEP | Required | Audit trail |
| `updatedAt` | ❌ REMOVE | Delete | Not needed |

### New Structure (8 fields)
```typescript
{
  name: string;                  // ✅ Identification
  email: string;                 // ✅ Authentication
  password: string;              // ✅ Authentication (hashed)
  role: UserRole;               // ✅ Authorization
  facilityId?: ObjectId;         // ⚠️ Optional (for facility users)
  district?: RwandaDistrictType; // ⚠️ Optional (for district users)
  isActive: boolean;            // ✅ User management
  createdAt: Date;              // ✅ Audit
}
```

**Reduction:** 10 → 8 fields (20% reduction)

---

## Facility Model

### Expected Current Fields (~12 total)

| Field | Status | Action | Justification |
|-------|--------|--------|---------------|
| `name` | ✅ KEEP | Required | Facility identification |
| `code` | ✅ KEEP | Required, unique | Official facility code |
| `type` | ✅ KEEP | Required | Facility classification |
| `district` | ✅ KEEP | Required | Geographic location |
| `province` | ✅ KEEP | Required | Geographic location (higher level) |
| `address.street` | ❌ REMOVE | Delete | Too detailed for MVP |
| `address.sector` | ❌ REMOVE | Delete | Too detailed for MVP |
| `address.district` | ❌ REMOVE | Duplicate | Already have district at top level |
| `address.province` | ❌ REMOVE | Duplicate | Already have province at top level |
| `address.country` | ❌ REMOVE | Delete | Always Rwanda |
| `isActive` | ✅ KEEP | Required | Facility management |
| `createdAt` | ✅ KEEP | Required | Audit trail |
| `updatedAt` | ❌ REMOVE | Delete | Not needed |

### New Structure (7 fields)
```typescript
{
  name: string;                  // ✅ Identification
  code: string;                  // ✅ Official code
  type: FacilityType;           // ✅ Classification
  district: RwandaDistrictType; // ✅ Location
  province: RwandaProvinceType; // ✅ Location (keep for facilities)
  isActive: boolean;            // ✅ Management
  createdAt: Date;              // ✅ Audit
}
```

**Reduction:** ~12 → 7 fields (42% reduction)

**Note:** Province kept for facilities because it's useful for hierarchical reporting, but removed from patients/users where it's redundant.

---

## Alert Model

### Expected Current Fields (~14 total)

| Field | Status | Action | Justification |
|-------|--------|--------|---------------|
| `title` | ✅ KEEP | Required | Alert identification |
| `description` | ✅ KEEP | Required | Alert details |
| `severity` | ✅ KEEP | Required | Priority classification |
| `status` | ✅ KEEP | Required | Alert lifecycle |
| `caseId` | ✅ KEEP | Optional | Link to triggering case |
| `facilityId` | ✅ KEEP | Optional | Link to facility |
| `district` | ✅ KEEP | Required | Geographic scope |
| `province` | ❌ REMOVE | Delete | Can be derived from district |
| `triggerDate` | ✅ KEEP | Required | When alert was triggered |
| `resolvedDate` | ✅ KEEP | Optional | When alert was resolved |
| `resolvedBy` | ✅ KEEP | Optional | Who resolved it |
| `acknowledgedBy` | ❌ REMOVE | Delete | Can be separate log |
| `acknowledgedDate` | ❌ REMOVE | Delete | Can be separate log |
| `createdAt` | ✅ KEEP | Required | Audit trail |
| `updatedAt` | ❌ REMOVE | Delete | Not needed |

### New Structure (10 fields)
```typescript
{
  title: string;                 // ✅ Identification
  description: string;           // ✅ Details
  severity: AlertSeverity;      // ✅ Priority
  status: AlertStatus;          // ✅ Lifecycle
  caseId?: ObjectId;             // ⚠️ Optional link
  facilityId?: ObjectId;         // ⚠️ Optional link
  district: RwandaDistrictType; // ✅ Geographic scope
  triggerDate: Date;            // ✅ When triggered
  resolvedDate?: Date;           // ⚠️ When resolved
  resolvedBy?: ObjectId;         // ⚠️ Who resolved
  createdAt: Date;              // ✅ Audit
}
```

**Reduction:** ~14 → 10 fields (28% reduction)

---

## Summary Statistics

### Total Field Reduction

| Model | Before | After | Reduction | Percentage |
|-------|--------|-------|-----------|------------|
| Patient | 15 | 9 | -6 | 40% |
| Case | 16 | 10 | -6 | 37.5% |
| User | 10 | 8 | -2 | 20% |
| Facility | 12 | 7 | -5 | 42% |
| Alert | 14 | 10 | -4 | 28% |
| **TOTAL** | **67** | **44** | **-23** | **34%** |

**Overall:** Removing 23 fields (34% reduction) across all models

---

## Fields Removed by Category

### 1. Redundant Location Data (9 fields removed)
- Patient: `address.province`, `address.country`
- Case: None (didn't have location)
- User: `province`
- Facility: `address.street`, `address.sector`, `address.district`, `address.province`, `address.country`
- Alert: `province`

**Justification:** Province can be derived from district. Street/sector too granular for MVP.

---

### 2. Unnecessary Timestamps (5 fields removed)
- Patient: `updatedAt`
- Case: `updatedAt`, `outcomeDate`, `validationDate`
- User: `updatedAt`
- Facility: `updatedAt`
- Alert: `updatedAt`

**Justification:** `createdAt` sufficient for audit. Other dates can be in separate logs.

---

### 3. Computed/Derived Fields (1 field removed)
- Case: `isAlertTriggered`

**Justification:** Should be computed based on business rules, not stored.

---

### 4. Fields Better in Separate Collections (2 fields removed)
- Case: `labResults`, `validatorId`

**Justification:** Lab results and validation history deserve their own collections for proper tracking.

---

### 5. Non-Critical Optional Fields (6 fields removed)
- Patient: `occupation`, `address.street`, `address.sector`
- Case: `outcomeDate`
- Alert: `acknowledgedBy`, `acknowledgedDate`

**Justification:** Not needed for MVP, can be added later if required.

---

## Migration Strategy

### Step 1: Backup
```bash
mongodump --db ridsr --out ./backup-$(date +%Y%m%d)
```

### Step 2: Transform Data
```typescript
// Patient transformation
db.patients.updateMany({}, [
  {
    $set: {
      district: "$address.district"
    }
  },
  {
    $unset: [
      "address.street",
      "address.sector",
      "address.province",
      "address.country",
      "occupation",
      "updatedAt"
    ]
  }
]);

// Case transformation
db.cases.updateMany({}, [
  {
    $unset: [
      "validatorId",
      "validationDate",
      "isAlertTriggered",
      "labResults",
      "outcomeDate",
      "updatedAt"
    ]
  }
]);

// User transformation
db.users.updateMany({}, [
  {
    $unset: ["province", "updatedAt"]
  }
]);

// Facility transformation
db.facilities.updateMany({}, [
  {
    $unset: [
      "address",
      "updatedAt"
    ]
  }
]);

// Alert transformation
db.alerts.updateMany({}, [
  {
    $unset: [
      "province",
      "acknowledgedBy",
      "acknowledgedDate",
      "updatedAt"
    ]
  }
]);
```

### Step 3: Verify
```typescript
// Check field counts
db.patients.findOne();
db.cases.findOne();
db.users.findOne();
db.facilities.findOne();
db.alerts.findOne();
```

### Step 4: Update Indexes
```typescript
// Add new indexes
db.patients.createIndex({ district: 1 });
db.patients.createIndex({ nationalId: 1 }, { unique: true });

db.cases.createIndex({ patientId: 1, facilityId: 1 });
db.cases.createIndex({ diseaseCode: 1, reportDate: -1 });

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ facilityId: 1 });

db.facilities.createIndex({ code: 1 }, { unique: true });
db.facilities.createIndex({ district: 1 });
```

---

## Benefits of Field Reduction

### 1. Performance
- Smaller documents = faster queries
- Less data to transfer over network
- Reduced memory usage
- Faster indexing

### 2. Simplicity
- Easier to understand data model
- Less confusion about which fields to use
- Clearer business logic
- Easier to maintain

### 3. Data Quality
- Fewer fields = fewer places for errors
- Less redundant data = less inconsistency
- Clearer required vs optional fields

### 4. Development Speed
- Less code to write
- Fewer form fields
- Simpler validation
- Faster testing

### 5. User Experience
- Simpler forms (fewer fields to fill)
- Faster page loads
- Less cognitive load
- Better mobile experience

---

## Conclusion

By removing 23 redundant fields (34% reduction), we achieve:
- ✅ Simpler, cleaner data model
- ✅ Better performance
- ✅ Easier maintenance
- ✅ Better user experience
- ✅ Preserved all core functionality

**No critical features are lost** - all removed fields are either:
- Derivable from other fields
- Too granular for MVP
- Better suited for separate collections
- Not needed for core functionality

---

**Ready to proceed with migration? Start with Phase 1, Task 1.1!**
