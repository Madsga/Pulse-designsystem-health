import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'secondary' | 'primary' | 'link';

const variants: Record<Variant, string> = {
  secondary: 'min-h-11 rounded border border-line-strong bg-raised px-5 font-medium text-fg hover:bg-line',
  primary:
    'min-h-11 rounded border border-accent bg-accent px-5 font-medium text-deep hover:border-accent-hover hover:bg-accent-hover',
  link: 'min-h-11 text-left font-medium text-accent underline underline-offset-3 hover:text-accent-hover',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'secondary', className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(variants[variant], className)} {...props} />;
}


/** "Open in Figma / Storybook / code" links. */
export function SourceLinks({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {['Figma', 'Storybook', 'code'].map((source) => (
        <Button key={source} variant="link" onClick={onOpen}>
          Open in {source}
        </Button>
      ))}
    </div>
  );
}
