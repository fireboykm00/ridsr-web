# RIDSR Platform Technical Architecture

## System Overview

The RIDSR platform is a comprehensive disease surveillance system built on a microservices architecture using Next.js 16 with the App Router. The system is designed to handle large-scale data collection, processing, and analysis while maintaining strict data isolation between facilities and districts.

## Technology Stack

### Frontend Technologies
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: @heroui/react components
- **Forms**: React Hook Form with Zod validation
- **Icons**: Heroicons v3
- **State Management**: NextAuth.js session management

### Backend Technologies
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod for schema validation
- **API**: RESTful APIs with Next.js API routes
- **Background Jobs**: Cron jobs for automated processes
- **File Processing**: PDF generation for reports

### Infrastructure
- **Deployment**: Docker containerization
- **Environment**: Cloud-native deployment
- **Caching**: Redis for session and data caching
- **Monitoring**: Application performance monitoring
- **Logging**: Structured logging for audit trails

## Core System Components

### Authentication & Authorization Service
- **Purpose**: Manages user authentication and role-based access control
- **Components**:
  - Credential validation
  - JWT token generation and validation
  - Session management
  - Role verification middleware
  - Facility-based access controls

### User Management Service
- **Purpose**: Handles user creation, updates, and role assignments
- **Components**:
  - User profile management
  - Role assignment and modification
  - Facility association
  - Password management
  - User search and filtering

### Facility Management Service
- **Purpose**: Manages health facilities and their hierarchies
- **Components**:
  - Facility registration and updates
  - District and province associations
  - Facility hierarchy maintenance
  - Geographic information management
  - Facility statistics and metrics

### Case Reporting Service
- **Purpose**: Handles disease case reporting and validation
- **Components**:
  - Case form management
  - Data validation and sanitization
  - Case submission workflow
  - Validation queue management
  - Case status tracking

### Data Processing Service
- **Purpose**: Processes incoming case data and performs analytics
- **Components**:
  - Data ingestion pipelines
  - Validation and cleaning routines
  - Statistical analysis engines
  - Trend detection algorithms
  - Outlier identification

### Alert Generation Service
- **Purpose**: Monitors data patterns and generates alerts
- **Components**:
  - Threshold rule engine
  - Real-time monitoring systems
  - Alert notification systems
  - Escalation workflows
  - Alert tracking and resolution

### Reporting Service
- **Purpose**: Generates automated reports and visualizations
- **Components**:
  - Report template management
  - Data aggregation engines
  - PDF generation systems
  - Scheduling and distribution
  - Historical report archives

### GIS Visualization Service
- **Purpose**: Provides geographic visualization of disease data
- **Components**:
  - Geographic data processing
  - Map rendering engines
  - Spatial analysis tools
  - Location-based filtering
  - Geographic trend visualization

## Data Architecture

### Database Schema

#### User Schema
```typescript
interface User {
  _id: ObjectId;
  workerId: string; // Unique identifier for the worker
  name: string;
  email: string;
  role: UserRole; // enum: admin, district_officer, health_worker, lab_technician, national_officer
  facilityId: ObjectId; // Reference to the user's facility
  districtId: ObjectId; // Reference to the user's district
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Facility Schema
```typescript
interface Facility {
  _id: ObjectId;
  name: string;
  code: string; // Unique facility code
  type: string; // health center, hospital, clinic, etc.
  districtId: ObjectId; // Reference to the district
  provinceId: ObjectId; // Reference to the province
  address: {
    street: string;
    sector: string;
    district: string;
    province: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Case Schema
```typescript
interface Case {
  _id: ObjectId;
  patientId: ObjectId; // Reference to patient
  facilityId: ObjectId; // Automatically populated from user's facility
  diseaseCode: string; // ICD-10 or other standard code
  symptoms: string[];
  onsetDate: Date;
  reportDate: Date;
  reporterId: ObjectId; // Automatically populated from user
  validationStatus: 'pending' | 'validated' | 'rejected';
  validatorId?: ObjectId; // Who validated the case
  validationDate?: Date;
  outcome?: 'recovered' | 'deceased' | 'transferred' | 'unknown';
  outcomeDate?: Date;
  labResults?: ObjectId[]; // References to related lab results
  isAlertTriggered: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### LabResult Schema
```typescript
interface LabResult {
  _id: ObjectId;
  caseId: ObjectId; // Reference to the associated case
  facilityId: ObjectId; // Automatically populated from user's facility
  testType: string; // PCR, culture, microscopy, etc.
  testName: string;
  testDate: Date;
  resultValue: string;
  resultUnit?: string;
  referenceRange?: string;
  interpretation: 'positive' | 'negative' | 'equivocal' | 'contaminated';
  technicianId: ObjectId; // Who performed the test
  validatedBy?: ObjectId; // Who validated the result
  validatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Architecture

### Authentication Flow
1. User enters worker ID and password
2. Credentials are validated against the database
3. JWT token is generated with user role and facility information
4. Session is established with appropriate permissions
5. User is redirected to role-specific dashboard

### Authorization Checks
- Route-level protection using middleware
- Component-level permission checks
- Data-level access controls based on facility/district
- API endpoint validation for data access

### Data Isolation
- Database queries automatically filtered by facility ID
- Role-based data access controls
- Cross-facility data access prevention
- Audit logging for all data access

## API Architecture

### Authentication Endpoints
- `POST /api/auth/signin` - User authentication
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/signout` - User logout

### User Management Endpoints
- `GET /api/users` - List users (filtered by role/facility)
- `POST /api/users` - Create user (facility admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Facility Endpoints
- `GET /api/facilities` - List facilities (filtered by district/national)
- `GET /api/facilities/:id` - Get specific facility
- `POST /api/facilities` - Create facility (admin only)

### Case Reporting Endpoints
- `GET /api/cases` - List cases (filtered by facility/district)
- `POST /api/cases` - Submit new case
- `PUT /api/cases/:id` - Update case
- `GET /api/cases/:id` - Get specific case

### Validation Endpoints
- `GET /api/validation/queue` - Get validation queue
- `POST /api/validation/:caseId` - Validate case
- `GET /api/validation/stats` - Validation statistics

## Integration Architecture

### External System Interfaces
- HL7 FHIR API for healthcare interoperability
- Laboratory Information System (LIS) integration
- Hospital Information System (HIS) integration
- Government health information exchange

### Data Exchange Protocols
- FHIR R4 for clinical data exchange
- RESTful APIs for custom integrations
- Batch processing for large data transfers
- Real-time streaming for urgent notifications

## Performance Architecture

### Caching Strategy
- Redis for session management
- Application-level caching for frequently accessed data
- CDN for static assets
- Browser caching for UI components

### Database Optimization
- Indexing on frequently queried fields
- Aggregation pipelines for analytics
- Connection pooling for database access
- Read replicas for analytics queries

### Load Balancing
- Horizontal scaling for web tier
- Database read/write splitting
- Geographic distribution for performance
- Auto-scaling based on demand

## Monitoring & Observability

### Application Monitoring
- Performance metrics collection
- Error tracking and alerting
- User activity monitoring
- System health checks

### Data Quality Monitoring
- Data validation checks
- Missing data detection
- Anomaly detection in reporting patterns
- Completeness metrics

### Security Monitoring
- Authentication failure monitoring
- Unauthorized access attempts
- Data access pattern analysis
- Compliance auditing

This technical architecture provides a robust foundation for the RIDSR platform, ensuring scalability, security, and maintainability while supporting the complex business requirements of disease surveillance in Rwanda.