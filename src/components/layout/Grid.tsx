// src/components/layout/Grid.tsx
import React from 'react';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ children, cols = {}, gap = 'md', className = '', ...props }, ref) => {
    // Default to 1 column if no breakpoints are specified
    const defaultCols = Object.keys(cols).length === 0 ? { sm: 1 } : cols;
    
    const colClasses = Object.entries(defaultCols)
      .map(([breakpoint, count]) => {
        const prefix = breakpoint === 'sm' ? '' : `${breakpoint}:`;
        return `${prefix}grid-cols-${count}`;
      })
      .join(' ');
    
    const gapClasses = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };
    
    const classes = `grid ${colClasses} ${gapClasses[gap]} ${className}`;
    
    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export default Grid;