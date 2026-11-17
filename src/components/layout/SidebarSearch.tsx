import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { COMPONENTS, CUSTOM_UI, ROLES, SOURCES } from '../../data/workspace';
import { cn } from '../../lib/cn';
import { formatNumber, percent } from '../../lib/format';
import { usePulse } from '../../state/PulseContext';
import type { Screen } from '../../types';

interface Result {
  id: string;
  title: string;
  detail: string;
  /** What kind of thing this is, shown beside the title */
  kind: string;
  /** Extra words that should find this result */
  keywords: string;
  open: () => void;
}

const PAGES: { id: Screen; title: string; keywords: string }[] = [
  { id: 'overview', title: 'Overview', keywords: 'home health score summary' },
  { id: 'adoption', title: 'Adoption', keywords: 'teams custom ui ignored missing coverage' },
  { id: 'drift', title: 'Drift', keywords: 'differences figma storybook code blast radius' },
  { id: 'components', title: 'Components', keywords: 'library treemap usage owner' },
  { id: 'impact', title: 'Impact', keywords: 'hours saved assumptions leadership summary' },
  { id: 'settings', title: 'Settings', keywords: 'sources team mapping roles audit log' },
];

const MAX_RESULTS = 8;

/** Lower is better: title starts with the query, then a word in the title does, then anywhere. */
function rank(r: Result, q: string) {
  const title = r.title.toLowerCase();
  if (title.startsWith(q)) return 0;
  if (title.split(/\s+/).some((w) => w.startsWith(q))) return 1;
  if (title.includes(q)) return 2;
  if (`${r.detail} ${r.keywords}`.toLowerCase().includes(q)) return 3;
  return -1;
}

export function SidebarSearch() {
  const { metrics: m, actions } = usePulse();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const optionId = (i: number) => `${listId}-option-${i}`;

  const index = useMemo<Result[]>(
    () => [
      ...PAGES.map((p) => ({
        id: `page-${p.id}`,
        title: p.title,
        detail: `Go to ${p.title}`,
        kind: 'Page',
        keywords: p.keywords,
        open: () => actions.navigate(p.id),
      })),
      ...COMPONENTS.map((c) => ({
        id: `component-${c.name}`,
        title: c.name,
        detail: `${formatNumber(c.uses)} uses, owned by ${c.owner}`,
        kind: 'Component',
        keywords: 'component',
        open: () => actions.openComponent(c.name),
      })),
      ...m.driftItems.map((d) => ({
        id: `drift-${d.id}`,
        title: `${d.component} drift`,
        detail: d.summary,
        kind: 'Drift',
        keywords: `${d.status} ${d.where}`,
        open: () => actions.openDriftItem(d.id),
      })),
      ...m.teams.map((t) => ({
        id: `team-${t.id}`,
        title: t.name,
        detail: `${percent(t.library / (t.library + t.ignored + t.missing))} adoption`,
        kind: 'Team',
        keywords: `${t.repo} ${t.figmaProject}`,
        open: () => actions.navigate('adoption'),
      })),
      ...CUSTOM_UI.map((r) => ({
        id: `custom-${r.id}`,
        title: r.name,
        detail: r.match,
        kind: 'Custom UI',
        keywords: r.classification,
        open: () => actions.navigate('adoption'),
      })),
      ...SOURCES.map((s) => ({
        id: `source-${s.name}`,
        title: s.name,
        detail: s.scope,
        kind: 'Source',
        keywords: 'settings connection',
        open: () => actions.navigate('settings'),
      })),
      ...ROLES.map((r) => ({
        id: `role-${r.name}`,
        title: `${r.name} role`,
        detail: r.can,
        kind: 'Role',
        keywords: 'permissions settings',
        open: () => actions.navigate('settings'),
      })),
    ],
    [m.driftItems, m.teams, actions],
  );

  const q = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      q
        ? index
            .map((r) => ({ r, score: rank(r, q) }))
            .filter((x) => x.score >= 0)
            .sort((a, b) => a.score - b.score)
            .slice(0, MAX_RESULTS)
            .map((x) => x.r)
        : [],
    [index, q],
  );
  const showList = open && q.length > 0;

  // "/" focuses search from anywhere, unless someone is already typing in a field
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key !== '/' || el.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const choose = (r: Result) => {
    r.open();
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && showList && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      if (query) setQuery('');
      else inputRef.current?.blur();
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search Pulse
      </label>
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        >
          <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="m10.5 10.5 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? optionId(active) : undefined}
          placeholder="Search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="min-h-11 w-full rounded border border-line bg-canvas pr-9 pl-9 text-fg placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        />
        {!query && (
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-[3px] border border-line px-1.5 text-micro leading-5 text-muted"
          >
            /
          </kbd>
        )}
      </div>

      {showList && (
        <div className="absolute top-full left-0 z-30 mt-1 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded border border-line-strong bg-raised shadow-[0_12px_32px_rgb(0_0_0/0.35)]">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-meta text-muted">
              Nothing matches “{query.trim()}”. Try a component, team or drift item.
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Search results" className="max-h-96 overflow-y-auto py-1">
              {results.map((r, i) => (
                <li
                  key={r.id}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  // mousedown would blur the input and close the list before click lands
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(r)}
                  onMouseMove={() => setActive(i)}
                  className={cn('cursor-pointer px-3 py-2', i === active && 'bg-raised-hover')}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-medium">{r.title}</span>
                    <span className="shrink-0 text-micro text-muted">{r.kind}</span>
                  </span>
                  <span className="block truncate text-micro text-muted">{r.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
