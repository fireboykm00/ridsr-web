# RIDSR Platform Development Rules & Guidelines

## Overview
This document establishes the rules and guidelines for developing the Rwanda National Integrated Disease Surveillance and Response Platform (RIDSR). These rules ensure consistency, maintainability, and alignment with the project's business logic and technical architecture.

## Prerequisites: Mandatory Reading
Before contributing to the RIDSR platform, developers must thoroughly read and understand:

1. **BUSINESS_LOGIC.md** - Core business requirements and user management
2. **TECHNICAL_ARCHITECTURE.md** - System architecture and component design
3. **SOURCE_CODE_STRUCTURE.md** - Complete directory structure and routing
4. **IMPLEMENTATION_PLAN.md** - Original implementation phases
5. **USER_EXPERIENCE.md** - User experience design and workflows
6. **ROADMAP.md** - Strategic roadmap and milestones
7. **GOVERNANCE.md** - Project governance and decision-making processes

## Core Development Principles

### 1. Facility-Based Data Isolation
- All data queries must be filtered by facility ID based on the authenticated user
- Cross-facility data access is strictly prohibited without explicit authorization
- Implement middleware to enforce facility-based access controls
- Ensure all API endpoints respect facility boundaries

### 2. Role-Based Access Control (RBAC)
- Implement role-based permissions as defined in the business logic
- Facility administrators can only manage users within their facility
- District officers can access all facilities in their assigned district
- Lab technicians can only view lab results for their facility
- Health workers can only report cases for their facility

### 3. Authentication Requirements
- Users authenticate using worker ID and password only (no email registration)
- Facility administrators create users for their facility
- Worker IDs must be unique within the system
- Implement secure password policies and rotation

### 4. Automatic Data Population
- All forms must automatically populate facility information based on user session
- Patient and case data should be linked to the correct facility automatically
- Geographic information should be derived from facility location
- Reporting periods should be calculated automatically

### 5. Search & Selection Interfaces
- Implement searchable dropdowns for complex data relationships
- Create patient search functionality with advanced filtering
- Implement facility selection with geographic filtering
- Add disease classification through hierarchical selection

## Coding Standards

### 1. TypeScript Best Practices
- Use strict TypeScript mode with noImplicitAny enabled
- Implement proper type definitions for all API responses
- Use interfaces for all entity schemas (User, Case, Facility, etc.)
- Implement discriminated unions for role-based types

### 2. Component Architecture
- Follow the component organization as defined in SOURCE_CODE_STRUCTURE.md
- Create reusable UI components in the `components/ui/` directory
- Implement feature-specific components in `features/{feature}/components/`
- Use hooks for data fetching and business logic in `features/{feature}/hooks/`

### 3. Naming Conventions
- Folders: kebab-case (e.g., `case-reporting`, `validation-queue`)
- Components: PascalCase (e.g., `CaseReportForm`, `ValidationQueue`)
- Functions: camelCase (e.g., `validateCase`, `getUserFacility`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `VALIDATION_STATUS`)
- Files: PascalCase for components, camelCase for utilities

### 4. File Organization
- Group related files in feature directories
- Separate components, hooks, and types by concern
- Use barrel exports (index.ts) for public APIs
- Maintain consistent import ordering

## Security Requirements

### 1. Authentication & Authorization
- Implement JWT-based authentication with proper expiration
- Use NextAuth.js for session management
- Enforce role-based access at both UI and API levels
- Implement secure password hashing and storage

### 2. Data Protection
- Encrypt sensitive data at rest and in transit
- Implement audit logging for all critical operations
- Sanitize all user inputs to prevent injection attacks
- Use HTTPS for all communications

### 3. API Security
- Implement rate limiting for all API endpoints
- Use input validation and sanitization for all requests
- Implement proper CORS policies
- Add authentication middleware to all protected endpoints

## Performance Guidelines

### 1. Database Optimization
- Create indexes on frequently queried fields
- Use aggregation pipelines for complex data operations
- Implement pagination for large datasets
- Optimize queries to minimize database load

### 2. Frontend Performance
- Implement code splitting for large bundles
- Use lazy loading for non-critical components
- Optimize images and assets
- Implement caching strategies appropriately

### 3. Network Efficiency
- Minimize payload sizes for API responses
- Implement compression for large data transfers
- Use efficient data serialization formats
- Optimize for low-bandwidth environments

## Testing Requirements

### 1. Test Coverage
- Maintain >80% test coverage for critical business logic
- Implement unit tests for all utility functions
- Create integration tests for API endpoints
- Develop end-to-end tests for user workflows

### 2. Test Types
- Unit tests for pure functions and components
- Integration tests for API endpoints and database operations
- End-to-end tests for critical user journeys
- Security tests for authentication and authorization

## Documentation Standards

### 1. Code Documentation
- Document all public APIs with JSDoc comments
- Add inline comments for complex business logic
- Maintain README files for each major component
- Update documentation when making significant changes

### 2. Architecture Documentation
- Update technical architecture document when adding new components
- Document API endpoints with examples and schemas
- Maintain data flow diagrams for complex processes
- Keep user journey maps updated with new features

## Quality Assurance

### 1. Code Reviews
- Require at least one reviewer for all pull requests
- Check for adherence to coding standards
- Verify security implications of changes
- Ensure new features don't break existing functionality

### 2. Continuous Integration
- Run all tests before merging code
- Perform security scans on dependencies
- Validate code formatting and linting
- Check for performance regressions

## Error Handling

### 1. Client-Side Errors
- Provide meaningful error messages to users
- Implement graceful degradation for network failures
- Show appropriate loading states
- Log errors for debugging purposes

### 2. Server-Side Errors
- Return appropriate HTTP status codes
- Implement centralized error logging
- Send error notifications to administrators
- Maintain error tracking for system health

## Internationalization & Accessibility

### 1. Multi-Language Support
- Implement internationalization for Kinyarwanda, French, and English
- Use proper locale detection and fallbacks
- Maintain translation files for all user-facing text
- Support RTL languages if required

### 2. Accessibility Compliance
- Follow WCAG 2.1 AA standards
- Implement proper semantic HTML
- Ensure keyboard navigation works for all features
- Use sufficient color contrast ratios

## Deployment & Operations

### 1. Environment Management
- Use environment variables for configuration
- Maintain separate configurations for dev, staging, and prod
- Implement secure credential management
- Use feature flags for gradual rollouts

### 2. Monitoring & Logging
- Implement comprehensive application logging
- Monitor system performance and errors
- Track user engagement and feature usage
- Set up alerts for critical system issues

## Refactoring Guidelines

### 1. When to Refactor
- Before adding new functionality to legacy code
- When code duplication exceeds acceptable thresholds
- When performance issues are identified
- When security vulnerabilities are discovered

### 2. Refactoring Process
- Write tests before refactoring to ensure functionality preservation
- Make incremental changes rather than large rewrites
- Update documentation to reflect structural changes
- Perform thorough testing after refactoring

## Dependency Management

### 1. Adding Dependencies
- Evaluate security and maintenance status before adding
- Prefer well-maintained, popular libraries
- Consider bundle size impact
- Document the reason for adding each dependency

### 2. Dependency Updates
- Regularly update dependencies to patch security vulnerabilities
- Test thoroughly after dependency updates
- Monitor for deprecated dependencies
- Plan for major version upgrades carefully

## Breaking Changes Policy

### 1. API Changes
- Maintain backward compatibility when possible
- Use versioning for breaking API changes
- Provide migration guides for breaking changes
- Communicate breaking changes to all stakeholders

### 2. Database Changes
- Plan database migrations carefully
- Ensure zero-downtime deployments where possible
- Backup data before making schema changes
- Test migrations in staging environment first

## Compliance Requirements

### 1. Healthcare Regulations
- Ensure compliance with healthcare data privacy laws
- Implement proper data retention policies
- Maintain audit trails for all data access
- Follow healthcare industry security standards

### 2. Local Regulations
- Comply with Rwandan data protection laws
- Follow Ministry of Health guidelines
- Maintain data residency requirements
- Implement proper reporting mechanisms

## Conclusion

These rules ensure that the RIDSR platform maintains high quality, security, and usability while meeting the specific requirements of Rwanda's disease surveillance system. All contributors must follow these guidelines to maintain consistency and alignment with the project's objectives.