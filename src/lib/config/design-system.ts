// src/lib/config/design-system.ts
// Color palette based on RIDSR design system
export const colors = {
  primary: {
    blue: '#1E40AF', // blue-700
  },
  background: {
    white: '#FFFFFF',
    surface: '#F9FAFB', // gray-50
  },
  text: {
    primary: '#111827', // gray-900
    secondary: '#6B7280', // gray-500
  },
  status: {
    success: '#10B981', // green-500
    warning: '#F59E0B', // amber-500
    danger: '#EF4444', // red-500
    info: '#3B82F6', // blue-500
  },
  rwanda: {
    blue: '#1E40AF', // Primary brand
    green: '#059669', // Secondary accent
    yellow: '#F59E0B', // Highlights
  },
};

// Spacing scale based on 4px grid
export const spacing = {
  micro: '4px', // space-y-1 (4px) - Tight grouping
  small: '8px', // space-y-2 (8px) - Related items
  medium: '16px', // space-y-4 (16px) - Section items
  large: '24px', // space-y-6 (24px) - Major sections
  xlarge: '32px', // space-y-8 (32px) - Page sections
};

// Typography scale
export const typography = {
  display: 'text-5xl font-bold', // 48px - Hero sections
  h1: 'text-3xl font-bold', // 30px - Page titles
  h2: 'text-2xl font-semibold', // 24px - Section headers
  h3: 'text-xl font-semibold', // 20px - Subsections
  bodyLarge: 'text-base', // 16px - Primary content
  body: 'text-sm', // 14px - Secondary content
  caption: 'text-xs', // 12px - Labels, metadata
};

// Breakpoints
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};

// Shadows
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};

// Radius
export const radius = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};