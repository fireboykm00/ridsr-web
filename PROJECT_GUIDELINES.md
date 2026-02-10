# RIDSR Platform - Project Guidelines

## Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Authentication**: Auth.js v5 (NextAuth.js v5 beta)
- **Styling**: Tailwind CSS v4
- **Icons**: Heroicons v3
- **Database**: MongoDB Atlas
- **Validation**: Zod
- **Forms**: React Hook Form + Zod Resolver

## Architecture & Best Practices

### 1. Authentication Updates
- Use the new Auth.js v5 pattern with `auth()` function
- Implement server-side authentication with `await auth()`
- Use the new proxy pattern instead of middleware (deprecated)
- Leverage the new `handlers: {GET, POST}` export pattern

### 2. Folder Structure
```
src/
├── app/
│   ├── (admin)/
│   │   └── admin/
│   ├── (main)/
│   │   ├── about/
│   │   ├── academy/
│   │   ├── certification/
│   │   ├── directory/
│   │   ├── dpn/
│   │   ├── faq/
│   │   ├── privacy-policy/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── register/
│   ├── error/
│   ├── not-found/
│   └── layout/
├── components/
│   ├── layout/
│   ├── pages/
│   └── ui/
├── features/
│   ├── about/
│   ├── academy/
│   ├── certification/
│   ├── directory/
│   ├── dpn/
│   ├── faq/
│   ├── home/
│   └── shared/
├── data/
│   ├── static/
│   ├── content/
│   └── constants/
├── hooks/
├── lib/
│   ├── config/
│   ├── utils/
│   └── services/
└── styles/
```

### 3. Component Patterns
- Follow glassmorphic minimalism design system
- Use no-border philosophy for inputs and cards
- Implement consistent spacing with Tailwind utilities
- Create reusable UI components in `components/ui/`
- Organize feature-specific components in `features/{feature-name}/`

### 4. Authentication Flow
- Protected routes handled via proxy.ts
- Role-based access control implemented in layouts and components
- Session provider wrapped at root layout level
- Client-side auth checks with `useSession` hook

### 5. Development Guidelines
- Always search for and follow new patterns before implementing
- Use Google search to find the latest documentation and best practices
- Keep components modular and reusable
- Follow accessibility standards (WCAG AA)
- Implement responsive design for all screen sizes

### 6. Naming Conventions
- Folders: kebab-case
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE

### 7. File Organization
- Component definitions should include displayName
- Export components from index files when appropriate
- Use TypeScript interfaces for props
- Follow consistent import ordering

### 8. Error Handling
- Implement proper error boundaries
- Handle loading states appropriately
- Provide meaningful error messages to users
- Log errors appropriately for debugging

### 9. Performance
- Implement code splitting where appropriate
- Optimize images and assets
- Use lazy loading for non-critical components
- Minimize bundle size

### 10. Testing
- Write unit tests for utility functions
- Implement integration tests for critical flows
- Use end-to-end testing for user journeys
- Follow test-driven development where appropriate