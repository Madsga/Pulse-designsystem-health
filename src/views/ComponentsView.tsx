import { Fragment, useEffect, useRef, useState } from 'react';
import { ComponentSample } from '../components/samples/ComponentSample';
import { SourceLinks } from '../components/ui/Button';
import { BlastTag } from '../components/ui/BlastTag';
import { Card, EmptyCard, Lead, Subheading } from '../components/ui/Card';
import { Cell, HeaderCell, Table, TableRow, UsageBars } from '../components/ui/Data';
import { Legend, LegendItem, Swatch } from '../components/ui/Legend';
import { SegmentedControl, ToggleGroup } from '../components/ui/Toggle';
import { TOTAL_COMPONENTS } from '../data/workspace';
import { cn } from '../lib/cn';
import { formatNumber } from '../lib/format';
import type { ComponentRow } from '../lib/metrics';
import { squarify } from '../lib/squarify';
import { usePulse } from '../state/PulseContext';
import type { ComponentFilter, ComponentMode } from '../types';

const COLUMNS = 'minmax(150px,1.2fr) 100px minmax(190px,1.4fr) minmax(130px,1fr) minmax(190px,1.2fr)';

const isAligned = (c: ComponentRow) => !c.openDrift && c.missingFrom.length === 0;

export function ComponentsView() {
  const { state, metrics: m, actions } = usePulse();
  const withDrift = m.components.filter((c) => c.openDrift);
  const filtered = state.componentFilter === 'drift' ? withDrift : m.components;
  const selected = m.components.find((c) => c.name === state.selectedComponent);
  const isMap = state.componentMode === 'map';
  const aligned = m.components.filter(isAligned).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Lead>
          {aligned} of your {m.components.length} most-used components match across Figma, Storybook and code.
        </Lead>
        <p className="text-muted">
          This sample shows {m.components.length} of {TOTAL_COMPONENTS} library components.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <ToggleGroup<ComponentFilter>
          label="Filter components"
          value={state.componentFilter}
          onChange={actions.setComponentFilter}
          options={[
            { value: 'all', label: 'All components' },
            { value: 'drift', label: `With open drift (${withDrift.length})` },
          ]}
        />
        <SegmentedControl<ComponentMode>
          label="View"
          className="ml-auto"
          value={state.componentMode}
          onChange={actions.setComponentMode}
          options={[
            { value: 'map', label: 'Map' },
            { value: 'list', label: 'List' },
          ]}
        />
      </div>

      {isMap ? (
        <div className="grid items-start gap-6 @4xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <Treemap components={filtered} selected={state.selectedComponent} onSelect={actions.selectComponent} />
          {selected ? (
            <Card aria-label="Selected component" className="min-w-0 overflow-hidden">
              <ComponentDetail component={selected} />
            </Card>
          ) : (
            <EmptyCard title="Select a component">See its variants, which teams use it, and any open drift.</EmptyCard>
          )}
        </div>
      ) : (
        <ComponentTable components={filtered} selected={state.selectedComponent} onToggle={actions.toggleComponent} />
      )}
    </div>
  );
}

/** Width of an element, kept in sync as it resizes. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Tile fill by state, using the same marks as the Overview strip, toned down so labels stay readable. */
function tileClass(c: ComponentRow) {
  if (c.openDrift)
    return cn(
      'border-line bg-raised pl-4',
      c.openDrift.blast === 3 ? 'shadow-[inset_5px_0_0_var(--color-danger)]' : 'shadow-[inset_5px_0_0_var(--color-drift-tag)]',
    );
  if (c.missingFrom.length) return 'border-dashed border-line-strong bg-transparent';
  return 'bg-accent/15 border-accent/30';
}

/** Components as tiles whose area is the instance count. */
function Treemap({ components, selected, onSelect }: { components: ComponentRow[]; selected: string | null; onSelect: (name: string) => void }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const height = Math.round(Math.min(520, Math.max(320, width * 0.78)));
  const tiles = width > 0 ? squarify(components.map((c) => ({ value: c.uses, item: c })), width, height) : [];

  return (
    <section aria-label="Components sized by usage" className="min-w-0">
      <div ref={ref} role="group" aria-label="Components, tile area is instance count" className="relative" style={{ height }}>
        {tiles.map(({ item: c, x, y, w, h }) => {
          const on = c.name === selected;
          const drift = c.openDrift;
          return (
            <button
              key={c.name}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(c.name)}
              className={cn(
                'absolute flex flex-col gap-0.5 overflow-hidden rounded-xs border px-2.5 py-2 text-left text-meta text-fg hover:brightness-125',
                'focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-white',
                tileClass(c),
                on && 'outline-3 -outline-offset-3 outline-accent',
              )}
              style={{ left: x + 1, top: y + 1, width: w - 2, height: h - 2 }}
            >
              <strong>{c.name}</strong>
              <span className="text-micro text-muted">{formatNumber(c.uses)} uses</span>
              {drift && <BlastTag level={drift.blast} className={cn('mt-0.5 text-xs', w < 150 && 'sr-only')} />}
              {!drift && c.missingFrom.length > 0 && <span className="text-xs text-muted">Not in {c.missingFrom.join(', ')}</span>}
            </button>
          );
        })}
      </div>
      <Legend className="mt-2 text-meta text-muted">
        <LegendItem mark="library">Aligned</LegendItem>
        <LegendItem mark="absent">Missing from a source</LegendItem>
        <LegendItem mark="drift">Open drift</LegendItem>
        <span>Tile area is instance count.</span>
      </Legend>
    </section>
  );
}

/** Component list with the selected component's detail expanded inline below its row. */
function ComponentTable({ components, selected, onToggle }: { components: ComponentRow[]; selected: string | null; onToggle: (name: string) => void }) {
  return (
    <section aria-label="Components" className="min-w-0">
      <Table label="Components" minWidth={820}>
        <TableRow columns={COLUMNS}>
          <HeaderCell>Component</HeaderCell>
          <HeaderCell>Instances</HeaderCell>
          <HeaderCell>Mapped across</HeaderCell>
          <HeaderCell>Owner</HeaderCell>
          <HeaderCell>Open drift</HeaderCell>
        </TableRow>
        {components.map((c) => {
          const on = c.name === selected;
          return (
            <Fragment key={c.name}>
              <TableRow columns={COLUMNS} className={on ? 'bg-raised' : undefined}>
                <Cell>
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => onToggle(c.name)}
                    className="min-h-11 text-left font-semibold text-accent underline underline-offset-3 hover:text-accent-hover"
                  >
                    {c.name}
                  </button>
                </Cell>
                <Cell>{formatNumber(c.uses)}</Cell>
                <Cell className="gap-2">
                  <Swatch mark={c.missingFrom.length ? 'absent' : 'library'} />
                  {c.mappedLabel}
                </Cell>
                <Cell>{c.owner}</Cell>
                <Cell>{c.openDrift ? <BlastTag level={c.openDrift.blast} /> : <span className="text-muted">None</span>}</Cell>
              </TableRow>
              {on && (
                <div role="row">
                  <div role="cell" className="border-b border-line bg-surface shadow-[inset_3px_0_0_var(--color-accent)]">
                    <ComponentDetail component={c} />
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </Table>
    </section>
  );
}

function ComponentDetail({ component: c }: { component: ComponentRow }) {
  const { metrics: m, actions } = usePulse();
  const headingId = `component-${c.name.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div aria-labelledby={headingId} className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={headingId} className="text-xl">
          {c.name}
        </h2>
        <p className="text-muted">
          {formatNumber(c.uses)} instances. {c.status}.
        </p>
      </div>

      <div className="mt-5">
        <Subheading>Variants and states</Subheading>
        <p className="mt-0.5 text-meta text-muted">Illustrative sample component.</p>
        <div className="mt-2">
          <ComponentSample name={c.name} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-6">
        <div>
          <Subheading>Usage by team</Subheading>
          <UsageBars
            className="mt-2.5"
            nameWidth={110}
            rows={m.usageByTeam(c.uses).map((t) => ({ name: t.name, count: formatNumber(t.count), share: t.share }))}
          />
          <p className="mt-2.5 text-meta text-muted">Split by each team's share of library instances in this sample.</p>
        </div>
        <div>
          <Subheading>Change history</Subheading>
          {c.openDrift ? (
            <div className="mt-2.5">
              <BlastTag level={c.openDrift.blast} />
              <p className="mt-1">
                {c.openDrift.summary}. {c.openDrift.status}.
              </p>
            </div>
          ) : (
            <p className="mt-2.5">No changes in the last 8 weeks.</p>
          )}
          <div className="mt-2.5">
            <SourceLinks onOpen={() => actions.notify('Source links are not connected in the prototype.')} />
          </div>
        </div>
      </div>
    </div>
  );
}
