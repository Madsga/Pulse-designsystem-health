import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div';
}

/** A bordered panel. Kept for the one working surface on a screen, not for every group. */
export function Card({ as: Tag = 'section', className, ...props }: CardProps) {
  return <Tag className={cn('rounded border border-line bg-surface', className)} {...props} />;
}

/** The sentence each screen opens with: its main answer, stated plainly. */
export function Lead({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn('max-w-[24em] text-[26px] leading-[1.2] text-balance @3xl:text-[30px]', className)}>
      {children}
    </h2>
  );
}

interface SectionHeadingProps {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}

/** An 18px section title with an optional muted description. */
export function SectionHeading({ id, title, description, className }: SectionHeadingProps) {
  return (
    <div className={className}>
      <h2 id={id} className="text-lg">
        {title}
      </h2>
      {description && <p className="mt-1 max-w-180 text-muted">{description}</p>}
    </div>
  );
}

/** A 14px semibold subsection title. */
export function Subheading({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-semibold tracking-normal', className)}>{children}</h3>;
}

/** Panel shown when a list or detail pane has nothing to show. */
export function EmptyCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded border border-dashed border-line-strong p-6">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-muted">{children}</p>
    </div>
  );
}
