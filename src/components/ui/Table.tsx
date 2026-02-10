// src/components/ui/Table.tsx
import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  isHoverable?: boolean;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ children, className = '', ...props }, ref) => {
  return (
    <div className="overflow-x-auto">
      <table
        ref={ref}
        className={`min-w-full divide-y divide-gray-200 ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
});

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ children, className = '', ...props }, ref) => {
  return (
    <thead ref={ref} className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
});

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(({ children, className = '', ...props }, ref) => {
  return (
    <tbody ref={ref} className={`divide-y divide-gray-200 ${className}`} {...props}>
      {children}
    </tbody>
  );
});

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ children, isHoverable = true, className = '', ...props }, ref) => {
  return (
    <tr 
      ref={ref} 
      className={`${isHoverable ? 'hover:bg-gray-50 transition-colors' : ''} ${className}`} 
      {...props}
    >
      {children}
    </tr>
  );
});

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(({ children, align = 'left', className = '', ...props }, ref) => {
  const alignment = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  return (
    <td
      ref={ref}
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${alignment[align]} ${className}`}
      {...props}
    >
      {children}
    </td>
  );
});

const TableHeaderCell = React.forwardRef<HTMLTableCellElement, TableHeaderCellProps>(({ children, align = 'left', className = '', ...props }, ref) => {
  const alignment = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  return (
    <th
      ref={ref}
      className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 ${alignment[align]} ${className}`}
      {...props}
    >
      {children}
    </th>
  );
});

Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableRow.displayName = 'TableRow';
TableCell.displayName = 'TableCell';
TableHeaderCell.displayName = 'TableHeaderCell';

export { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell };