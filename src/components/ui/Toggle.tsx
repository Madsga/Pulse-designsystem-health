import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'> {
  pressed: boolean;
}

/** An outlined button that shows a pressed state. */
export function ToggleButton({ pressed, className, ...props }: ToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'min-h-11 rounded border px-4 text-left text-fg',
        pressed ? 'border-accent bg-raised' : 'border-control bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

export interface Option<T extends string> {
  value: T;
  label: ReactNode;
}

interface ToggleGroupProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** A row of toggle buttons where exactly one is pressed. */
export function ToggleGroup<T extends string>({ label, options, value, onChange, className }: ToggleGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {options.map((o) => (
        <ToggleButton key={o.value} pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </ToggleButton>
      ))}
    </div>
  );
}

/** A joined, filled segmented control (e.g. Map view / List view). */
export function SegmentedControl<T extends string>({ label, options, value, onChange, className }: ToggleGroupProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn('inline-flex overflow-hidden rounded border border-control', className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn('min-h-10.5 min-w-21 px-4 font-medium', on ? 'bg-fg text-deep' : 'bg-transparent text-fg')}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
