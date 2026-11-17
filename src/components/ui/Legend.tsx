import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * The marks Pulse uses everywhere, so a colour or pattern means the same thing on every screen:
 * library = from the library and aligned, gap = gain still to make, absent = missing from a source or the library,
 * drift = open drift, severe = drift that must be deprecated.
 */
export type Mark = 'library' | 'gap' | 'absent' | 'drift' | 'severe';

export const MARK_FILL: Record<Mark, string> = {
  library: 'bg-accent/45',
  gap: 'bg-hatched',
  absent: 'border border-line-strong',
  drift: 'bg-drift-tag',
  severe: 'bg-danger',
};

export function Swatch({ mark, className }: { mark?: Mark; className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block h-3 w-2 shrink-0 rounded-[1px]', mark && MARK_FILL[mark], className)} />;
}

/** A swatch and its label, laid out for a legend row. */
export function LegendItem({ mark, children }: { mark: Mark; children: ReactNode }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-2">
      <Swatch mark={mark} />
      {children}
    </span>
  );
}

export function Legend({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap items-center gap-x-6 gap-y-1', className)}>{children}</div>;
}
