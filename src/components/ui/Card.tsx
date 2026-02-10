// src/components/ui/Card.tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  shadow?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, shadow = 'sm', rounded = 'xl', padding = 'md', className = '', ...props }, ref) => {
    const shadowClasses = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg'
    };
    
    const roundedClasses = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl'
    };
    
    const paddingClasses = {
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    };
    
    const classes = `bg-white ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${paddingClasses[padding]} transition-shadow hover:${shadowClasses.md} ${className}`;
    
    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;