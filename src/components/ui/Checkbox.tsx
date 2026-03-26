import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded border border-border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-background data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground',
        accent: 'bg-background data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'>,
    VariantProps<typeof checkboxVariants> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

const CheckIcon = () => (
  <svg
    className="h-3 w-3"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 6l3 3 5-6" />
  </svg>
);

const MinusIcon = () => (
  <svg
    className="h-3 w-3"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M2 6h8" />
  </svg>
);

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      error,
      indeterminate = false,
      variant = 'default',
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    const hasError = !!error;
    const isChecked = checked || indeterminate;

    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center pt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            aria-checked={indeterminate ? 'mixed' : checked}
            aria-invalid={hasError}
            aria-describedby={description ? `${checkboxId}-description` : undefined}
            data-state={indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked'}
            className={cn(
              checkboxVariants({ variant }),
              hasError && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            {...props}
          />
        </div>

        {(label || description || error) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'text-sm font-medium leading-none cursor-pointer select-none',
                  disabled && 'cursor-not-allowed opacity-50',
                  hasError ? 'text-destructive' : 'text-foreground'
                )}
              >
                {label}
              </label>
            )}
            {description && !error && (
              <p
                id={`${checkboxId}-description`}
                className="text-xs text-muted-foreground"
              >
                {description}
              </p>
            )}
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
