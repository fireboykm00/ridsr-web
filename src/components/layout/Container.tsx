// src/components/layout/Container.tsx
import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, maxWidth = '2xl', padding = 'md', className = '', ...props }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full'
    };
    
    const paddingClasses = {
      none: 'px-0',
      sm: 'px-4',
      md: 'px-6',
      lg: 'px-8'
    };
    
    const classes = `mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} w-full ${className}`;
    
    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;