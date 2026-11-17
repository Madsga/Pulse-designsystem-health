import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../../lib/cn';
import { usePulse } from '../../state/PulseContext';
import type { Screen } from '../../types';
import { SidebarSearch } from './SidebarSearch';

const NAV: { id: Screen; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'adoption', label: 'Adoption' },
  { id: 'drift', label: 'Drift' },
  { id: 'components', label: 'Components' },
  { id: 'impact', label: 'Impact' },
  { id: 'settings', label: 'Settings' },
];

const USER = { name: 'Mads Buciek', role: 'Design Lead' };

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function Sidebar() {
  const { state, metrics, actions } = usePulse();

  return (
    <div className="flex h-screen max-w-full flex-[1_1_232px] flex-col gap-5 border-r border-raised bg-deep px-4 py-5 relative z-20 min-[800px]:sticky min-[800px]:top-0">
      <div>
        <p className="text-[22px] font-medium tracking-[-0.03em]">Pulse</p>
        <p className="mt-0.5 text-meta text-muted">Design system health</p>
      </div>

      <search>
        <SidebarSearch />
      </search>

      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV.map(({ id, label }) => {
          const current = state.screen === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={current ? 'page' : undefined}
              onClick={() => actions.navigate(id)}
              className={cn(
                'flex min-h-11 w-full items-center justify-between gap-2 rounded px-3 text-left hover:bg-raised hover:text-fg',
                current ? 'bg-raised font-semibold text-fg' : 'font-medium text-muted',
              )}
            >
              <span>{label}</span>
              {id === 'drift' && <span className="text-meta text-muted">{metrics.openDrift.length}</span>}
            </button>
          );
        })}
      </nav>

      <UserSection />
    </div>
  );
}

/** Who is signed in. The row opens a menu with user settings and logging in or out. */
function UserSection() {
  const { actions } = usePulse();
  const [signedIn, setSignedIn] = useState(true);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Focus the first item on open, and close when clicking anywhere outside
  useEffect(() => {
    if (!open) return;
    itemRefs.current[0]?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const items = [
    {
      label: 'User settings',
      run: () => actions.notify('User settings are not part of the prototype.'),
    },
    signedIn
      ? {
          label: 'Log out',
          run: () => {
            setSignedIn(false);
            actions.notify('Logged out. This is a prototype, so your session continues.');
          },
        }
      : {
          label: 'Log in',
          run: () => {
            setSignedIn(true);
            actions.dismissToast();
          },
        },
  ];

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = itemRefs.current.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (i: number) => itemRefs.current[(i + items.length) % items.length]?.focus();
    if (e.key === 'ArrowDown') focusAt(current + 1);
    else if (e.key === 'ArrowUp') focusAt(current - 1);
    else if (e.key === 'Home') focusAt(0);
    else if (e.key === 'End') focusAt(items.length - 1);
    else if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault();
      close(e.key === 'Escape');
      return;
    } else return;
    e.preventDefault();
  };

  return (
    <section ref={rootRef} aria-label="Account" className="relative mt-auto border-t border-line pt-4">
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
          className="absolute inset-x-0 bottom-full z-30 mb-2 rounded border border-line-strong bg-raised py-1 shadow-[0_12px_32px_rgb(0_0_0/0.35)]"
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                item.run();
                close();
              }}
              className="flex min-h-11 w-full items-center px-3 text-left hover:bg-raised-hover focus-visible:bg-raised-hover focus-visible:outline-none"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn('flex w-full items-center gap-3 rounded p-1.5 text-left hover:bg-raised', open && 'bg-raised')}
      >
        {signedIn ? (
          <>
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/20 text-meta font-semibold text-accent"
            >
              {initials(USER.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{USER.name}</span>
              <span className="block truncate text-meta text-muted">{USER.role}</span>
            </span>
          </>
        ) : (
          <>
            <span aria-hidden="true" className="size-9 shrink-0 rounded-full border border-dashed border-line-strong" />
            <span className="min-w-0 flex-1 text-muted">Logged out</span>
          </>
        )}
        {/* <svg aria-hidden="true" viewBox="0 0 16 16" className={cn('size-4 shrink-0 text-muted', open && 'rotate-180')}>
          <path d="m4 10 4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg> */}
      </button>
    </section>
  );
}
