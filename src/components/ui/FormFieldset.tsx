// src/components/ui/FormFieldset.tsx
import React from 'react';

interface FormFieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string;
  children: React.ReactNode;
}

const FormFieldset = React.forwardRef<HTMLFieldSetElement, FormFieldsetProps>(
  ({ legend, children, className = '', ...props }, ref) => {
    return (
      <fieldset 
        ref={ref} 
        className={`border border-gray-200 rounded-lg p-6 ${className}`}
        {...props}
      >
        {legend && (
          <legend className="text-lg font-medium text-gray-900 px-2">
            {legend}
          </legend>
        )}
        <div className="mt-4 space-y-4">
          {children}
        </div>
      </fieldset>
    );
  }
);

FormFieldset.displayName = 'FormFieldset';

export { FormFieldset };