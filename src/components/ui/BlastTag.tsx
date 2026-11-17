import { BLAST_LEVELS } from '../../data/workspace';
import { cn } from '../../lib/cn';
import type { BlastLevel } from '../../types';

/** Blast radius label with a four-step meter, so the level never relies on colour alone. */
export function BlastTag({ level, className }: { level: BlastLevel; className?: string }) {
  const info = BLAST_LEVELS[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-meta font-medium whitespace-nowrap',
        info.severe ? 'text-danger' : 'text-fg',
        className,
      )}
    >
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {[0, 1, 2, 3].map((step) => (
          <span key={step} className={cn('h-3 w-1', step <= level ? 'bg-current' : 'bg-line')} />
        ))}
      </span>
      {info.label}
    </span>
  );
}
