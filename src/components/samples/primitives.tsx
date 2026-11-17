// Illustrative "customer design system" pieces, drawn on a light stage so they
// read as product UI rather than Pulse UI. `diff` adds the dashed outline that
// marks what differs between sources.
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface SampleProps {
  diff?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function Stage({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'flex min-h-22 flex-wrap items-center gap-x-3.5 gap-y-3 rounded bg-sample-stage p-4 text-meta leading-[1.4] text-sample-ink',
        className,
      )}
    >
      {children}
    </div>
  );
}

export const Row = ({ className, children }: SampleProps) => (
  <span className={cn('inline-flex items-center gap-2', className)}>{children}</span>
);

export const Col = ({ className, style, children }: SampleProps) => (
  <div className={cn('flex flex-col items-start gap-1', className)} style={style}>
    {children}
  </div>
);

export const Label = ({ diff, className, children }: SampleProps) => (
  <span className={cn('text-[11.5px] text-sample-muted', diff && 'sample-diff', className)}>{children}</span>
);

/** "Code only" style annotation next to a diff. */
export const DiffNote = ({ children }: { children: ReactNode }) => (
  <span className="text-[11.5px] font-semibold text-sample-tag">{children}</span>
);

type ButtonKind = 'default' | 'primary' | 'ghost' | 'danger' | 'destructive';
const buttonKinds: Record<ButtonKind, string> = {
  default: 'border-sample-border bg-white',
  primary: 'border-sample-blue bg-sample-blue text-white',
  ghost: 'border-transparent bg-transparent',
  /** Outlined red */
  danger: 'border-sample-red bg-white text-sample-red',
  /** Filled red */
  destructive: 'border-sample-red bg-sample-red text-white',
};

export const SButton = ({ kind = 'default', diff, className, style, children }: SampleProps & { kind?: ButtonKind }) => (
  <span
    className={cn(
      'inline-flex h-8 items-center rounded border px-3.5 text-meta font-medium',
      buttonKinds[kind],
      diff && 'sample-diff',
      className,
    )}
    style={style}
  >
    {children}
  </span>
);

export const SInput = ({ error, diff, className, style, children }: SampleProps & { error?: boolean }) => (
  <span
    className={cn(
      'inline-flex h-8 min-w-35 items-center rounded border bg-white px-2.5 text-sample-ink',
      error ? 'border-sample-red' : 'border-sample-field',
      diff && 'sample-diff',
      className,
    )}
    style={style}
  >
    {children}
  </span>
);

export const SSelect = ({ diff, trailing = <span>▾</span>, className }: SampleProps & { trailing?: ReactNode }) => (
  <SInput diff={diff} className={cn('min-w-42.5 justify-between', className)}>
    Choose a plan {trailing}
  </SInput>
);

export const FieldError = ({ diff, style, children }: SampleProps) => (
  <span className={cn('text-xs text-sample-red', diff && 'sample-diff')} style={style}>
    {children}
  </span>
);

export const SCheckbox = ({ checked, diff, style }: SampleProps & { checked?: boolean }) => (
  <span
    className={cn(
      'inline-flex size-4.5 items-center justify-center rounded border-[1.5px] text-xs text-white',
      checked ? 'border-sample-blue bg-sample-blue' : 'border-[#6b6b65] bg-white',
      diff && 'sample-diff',
    )}
    style={style}
  >
    {checked && '✓'}
  </span>
);

type BadgeTone = 'info' | 'ok' | 'warn' | 'neutral';
const badgeTones: Record<BadgeTone, string> = {
  info: 'bg-[#dbeafe] text-[#1e40af]',
  ok: 'bg-[#dcfce7] text-[#166534]',
  warn: 'bg-[#fef3c7] text-[#92400e]',
  neutral: 'bg-[#e7e7e2] text-[#3a3a36]',
};

export const SBadge = ({ tone, diff, children }: SampleProps & { tone: BadgeTone }) => (
  <span className={cn('inline-flex rounded px-2 py-0.5 text-xs font-medium', badgeTones[tone], diff && 'sample-diff')}>
    {children}
  </span>
);

export const STooltip = () => (
  <Col className="items-center">
    <span className="rounded bg-sample-ink px-2.5 py-1.5 text-xs text-white">Copy link</span>
    <SButton className="mt-1.5">Share</SButton>
  </Col>
);

export const SCard = ({ className, children }: SampleProps) => (
  <div className={cn('min-w-42.5 rounded border border-sample-line bg-white px-3.5 py-3', className)}>{children}</div>
);

export interface MenuItem {
  label: string;
  /** Destructive action, set apart below a divider */
  danger?: boolean;
}

export const SMenu = ({ items, active = 0, className }: { items: Array<string | MenuItem>; active?: number; className?: string }) => (
  <div className={cn('min-w-37.5 rounded-lg border border-[#d0d0ca] bg-white p-1 shadow-[0_4px_12px_rgb(0_0_0/0.08)]', className)}>
    {items.map((raw, i) => {
      const item = typeof raw === 'string' ? { label: raw } : raw;
      return (
        <div
          key={item.label}
          className={cn(
            'rounded px-2.5 py-1.5',
            i === active && 'bg-[#e8eefd]',
            item.danger && 'mt-1 rounded-none border-t border-sample-row text-sample-red',
          )}
        >
          {item.label}
        </div>
      );
    })}
  </div>
);

export const SAvatar = ({ className, style, children }: SampleProps) => (
  <span
    className={cn(
      'inline-flex size-8 items-center justify-center rounded-full border-2 border-sample-stage bg-[#c7d2fe] text-xs font-semibold text-[#1e1b4b]',
      className,
    )}
    style={style}
  >
    {children}
  </span>
);

const TABLE_ROWS = [
  ['Checkout', 'Anna', 'Live'],
  ['Account', 'Jon', 'Draft'],
  ['Search', 'Mia', 'Live'],
];

export const STable = ({ stickyHeaderDiff }: { stickyHeaderDiff?: boolean }) => {
  const row = 'grid grid-cols-[1.2fr_1fr_.8fr] gap-2 border-b border-sample-row px-2.5 py-1.5';
  return (
    <div className="min-w-62.5 overflow-hidden rounded-lg border border-sample-line bg-white">
      <div
        className={cn(row, 'bg-sample-head font-semibold', stickyHeaderDiff && 'sample-diff shadow-[0_3px_6px_rgb(0_0_0/0.12)]')}
      >
        <span>Name</span>
        <span>Owner</span>
        <span>Status</span>
      </div>
      {TABLE_ROWS.map((r) => (
        <div key={r[0]} className={row}>
          {r.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

export const STabs = ({ counter }: { counter?: ReactNode }) => (
  <div className="flex min-w-60 gap-4 border-b border-sample-border">
    <span className="inline-flex items-center gap-1.5 border-b-2 border-sample-blue px-0.5 py-1.5 font-semibold">Overview</span>
    <span className="inline-flex items-center gap-1.5 px-0.5 py-1.5 text-sample-muted">Activity {counter}</span>
    <span className="inline-flex items-center gap-1.5 px-0.5 py-1.5 text-sample-muted">Settings</span>
  </div>
);

export const SToast = ({ variant = 'success', diff }: { variant?: 'success' | 'plain'; diff?: boolean }) =>
  variant === 'success' ? (
    <div className="flex min-w-45 items-center gap-3 rounded-lg border border-l-4 border-[#d0d0ca] border-l-sample-green bg-white px-3.5 py-2.5">
      <span className="font-semibold text-sample-green">✓</span>
      <span>Changes saved</span>
    </div>
  ) : (
    <div className={cn('flex min-w-45 items-center gap-3 rounded-lg bg-sample-ink px-3.5 py-2.5 text-white', diff && 'sample-diff')}>
      <span>Changes saved</span>
    </div>
  );

/** Modal size frame (S / M / Full). */
export const SFrame = ({ width, height, diff, children }: { width: number; height: number; diff?: boolean; children: ReactNode }) => (
  <span
    className={cn(
      'flex items-center justify-center rounded border border-sample-field bg-white text-[11px] text-sample-muted',
      diff && 'sample-diff border-dashed',
    )}
    style={{ width, height }}
  >
    {children}
  </span>
);
