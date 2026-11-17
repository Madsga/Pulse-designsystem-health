import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div';
}

export function Card({ as: Tag = 'section', className, ...props }: CardProps) {
  return <Tag className={cn('rounded border border-line bg-surface', className)} {...props} />;
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
      {description && <p className="mt-1 text-muted">{description}</p>}
    </div>
  );
}

/** A 14px semibold subsection title. */
export function Subheading({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-semibold', className)}>{children}</h3>;
}

/** Small uppercase eyebrow label. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-micro font-medium tracking-[0.06em] text-muted uppercase', className)}>{children}</h3>;
}

/** A bordered row: content on the left, actions on the right, wrapping on narrow screens. */
export function ItemRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 rounded border border-line px-3.5 py-3', className)}>
      {children}
    </div>
  );
}

/** A title + muted detail pair, used inside rows. */
export function ItemText({ title, detail }: { title: ReactNode; detail?: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="font-semibold">{title}</p>
      {detail && <p className="text-meta text-muted">{detail}</p>}
    </div>
  );
}

/** Card shown when a list or detail pane has nothing to show. */
export function EmptyCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card as="div" className="p-6">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-muted">{children}</p>
    </Card>
  );
}
