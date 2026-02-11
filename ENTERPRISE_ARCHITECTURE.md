# RIDSR Platform - Enterprise-Level Architecture

## Overview

The Rwanda National Integrated Disease Surveillance and Response (RIDSR) Platform is built with an enterprise-level architecture that emphasizes security, scalability, and maintainability. This document outlines the key architectural decisions and patterns implemented.

## Core Architecture Principles

### 1. Role-Based Access Control (RBAC)
- **Hierarchical Role System**: Roles are organized in a hierarchy where higher roles inherit permissions from lower roles
- **Fine-Grained Permissions**: Access control is enforced at multiple levels (UI, API, Data)
- **Resource-Based Access**: Permissions are evaluated based on the specific resource being accessed

### 2. Data Isolation
- **Facility-Based Isolation**: Users can only access data from their assigned facility
- **District-Based Isolation**: District officers can access data from facilities in their district
- **National Access**: National officers and admins have access to all data

### 3. Security-First Approach
- **Zero Trust Model**: Every request is validated for proper authentication and authorization
- **Defense in Depth**: Multiple layers of security controls (network, application, data)
- **Principle of Least Privilege**: Users are granted minimal permissions necessary for their role

## Architecture Layers

### Presentation Layer
- **Next.js 16 with App Router**: Modern React framework with server-side rendering
- **Role-Based UI Rendering**: Components and navigation dynamically adjust based on user role
- **Client-Side Authorization**: Additional UI-level access control for better UX

### Application Layer
- **API Route Handlers**: Secure API endpoints with role-based access control
- **Service Layer**: Business logic encapsulated in reusable services
- **Authorization Middleware**: Centralized access control logic

### Data Layer
- **MongoDB with Mongoose**: Flexible document-based storage
- **Data Filtering Services**: Automatic filtering of data based on user permissions
- **Secure Data Access**: All data queries include appropriate access controls

## Key Components

### 1. Access Control Utilities (`src/lib/utils/access-control.ts`)
Centralized functions for evaluating user permissions:
- `hasRole()` - Check if user has a specific role
- `canAccessFacility()` - Check facility access permissions
- `canPerformAction()` - Check if user can perform specific actions

### 2. Role-Based Navigation (`src/components/layout/Sidebar.tsx`)
Dynamic sidebar that renders only accessible navigation items based on user role.

### 3. API Route Protection
Each API route includes role-based access control checks to prevent unauthorized access.

### 4. Service Layer Filtering
Services like `case.service.ts` and `patient.service.ts` include automatic filtering based on user permissions.

## Security Implementation

### Authentication
- **NextAuth.js v5**: Robust authentication system
- **JWT Tokens**: Secure session management
- **Worker ID & Password**: Custom authentication using worker ID instead of email

### Authorization
- **Route-Level Protection**: Middleware protects routes based on role
- **Component-Level Protection**: UI components conditionally render based on permissions
- **API-Level Protection**: Each API endpoint validates user permissions
- **Data-Level Protection**: Query results are filtered based on user access

### Data Isolation
- **Automatic Facility Assignment**: Cases and patients are automatically associated with user's facility
- **Query Filtering**: All data queries are filtered based on user's access level
- **Cross-Facility Prevention**: Strict controls prevent access to data from other facilities

## Testing Strategy

### Integration Tests
- API access control validation
- Authentication flow verification
- End-to-end system validation
- Security boundary testing

### Test Coverage
- Role-based access validation
- Data isolation enforcement
- Authentication flow
- API endpoint protection

## Enterprise Features

### Scalability
- Modular architecture allows for easy extension
- Service-oriented design promotes reusability
- Asynchronous processing for heavy operations

### Maintainability
- Clear separation of concerns
- Consistent coding patterns
- Comprehensive documentation
- Automated testing

### Compliance
- Data privacy by design
- Audit trail capabilities
- Role-based access logging
- Secure data handling

## Deployment Architecture

### Environment Configuration
- Separate configurations for development, staging, and production
- Secure credential management
- Environment-specific feature flags

### Monitoring & Observability
- Request logging with user context
- Performance monitoring
- Error tracking
- Security event logging

## Future Enhancements

### Advanced Features
- Multi-factor authentication
- Advanced audit logging
- Performance optimization
- Additional integration points

### Scaling Considerations
- Database sharding for large datasets
- Caching strategies for improved performance
- Load balancing for high availability
- CDN for static assets

## Conclusion

This architecture provides a solid foundation for an enterprise-level disease surveillance platform with robust security, clear separation of concerns, and extensible design patterns. The implementation follows industry best practices for healthcare applications while meeting the specific requirements of the Rwandan health system.