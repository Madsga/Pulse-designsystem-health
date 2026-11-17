import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** A large display number. */
export function BigNumber({ children, size = 44, className }: { children: ReactNode; size?: 32 | 40 | 44 | 56; className?: string }) {
  const sizes = {
    32: 'text-[32px] font-semibold',
    40: 'text-[40px] leading-[1.1] font-medium tracking-[-0.04em]',
    44: 'text-[44px] leading-[1.1] font-medium tracking-[-0.04em]',
    56: 'text-[56px] leading-none font-medium tracking-[-0.04em]',
  };
  return <span className={cn(sizes[size], className)}>{children}</span>;
}

interface MeterProps {
  /** 0–1 */
  value: number;
  rounded?: boolean;
  className?: string;
}

/** A horizontal bar on a hatched track. */
export function Meter({ value, rounded = true, className }: MeterProps) {
  const r = rounded && 'rounded';
  return (
    <div className={cn('bg-hatched h-2', r, className)}>
      <div className={cn('h-2 bg-accent', r)} style={{ width: `${(value * 100).toFixed(1)}%` }} />
    </div>
  );
}

interface SparklineProps {
  values: number[];
  label: string;
  width?: number;
  height?: number;
}

export function Sparkline({ values, label, width = 160, height = 40 }: SparklineProps) {
  const pad = 4;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - pad - ((v - min) / span) * (height - pad * 2)).toFixed(1)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label={label}>
      <polygon points={`${points} ${width},${height} 0,${height}`} fill="rgb(125 211 252 / 0.12)" />
      <polyline
        points={points}
        fill="none"
        className="stroke-accent"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Div-based tables (role="table") that scroll horizontally on narrow screens ── */

interface TableProps {
  label: string;
  minWidth?: number;
  children: ReactNode;
}

export function Table({ label, minWidth, children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <div role="table" aria-label={label} style={{ minWidth }}>
        {children}
      </div>
    </div>
  );
}

export function TableRow({ columns, className, style, children }: { columns: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div role="row" className={cn('grid', className)} style={{ gridTemplateColumns: columns, ...style }}>
      {children}
    </div>
  );
}

export function HeaderCell({ children }: { children: ReactNode }) {
  return (
    <div role="columnheader" className="border-b border-line px-4 py-2.5 text-micro font-medium text-muted">
      {children}
    </div>
  );
}

export function Cell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="cell" className={cn('flex min-w-0 items-center border-b border-raised px-4 py-3', className)}>
      {children}
    </div>
  );
}

/** Bar chart rows: name, bar, count. */
export function UsageBars({
  rows,
  nameWidth,
  rounded = true,
  className,
}: {
  rows: { name: string; count: string; share: number }[];
  nameWidth: number;
  rounded?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      {rows.map((r) => (
        <div key={r.name} className="grid items-center gap-2.5" style={{ gridTemplateColumns: `${nameWidth}px 1fr auto` }}>
          <span>{r.name}</span>
          <Meter value={r.share} rounded={rounded} />
          <span className="min-w-9 text-right font-semibold">{r.count}</span>
        </div>
      ))}
    </div>
  );
}
