// src/components/ui/Form.tsx
import React from 'react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ children, onSubmit, ...props }, ref) => {
    return (
      <form 
        ref={ref} 
        onSubmit={onSubmit} 
        className="space-y-6"
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';

export { Form };