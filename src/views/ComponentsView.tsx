import { Fragment } from 'react';
import { ComponentSample } from '../components/samples/ComponentSample';
import { SourceLinks } from '../components/ui/Button';
import { Card, Subheading } from '../components/ui/Card';
import { Cell, HeaderCell, Table, TableRow, UsageBars } from '../components/ui/Data';
import { SegmentedControl, ToggleGroup } from '../components/ui/Toggle';
import { BLAST_LEVELS, TOTAL_COMPONENTS } from '../data/workspace';
import { cn } from '../lib/cn';
import { formatNumber } from '../lib/format';
import type { ComponentRow } from '../lib/metrics';
import { squarify } from '../lib/squarify';
import { usePulse } from '../state/PulseContext';
import type { ComponentFilter, ComponentMode } from '../types';

const MAP_WIDTH = 680;
const MAP_HEIGHT = 520;
const COLUMNS = 'minmax(150px,1.2fr) 100px minmax(170px,1.3fr) minmax(130px,1fr) minmax(130px,1fr)';

export function ComponentsView() {
  const { state, metrics: m, actions } = usePulse();
  const withDrift = m.components.filter((c) => c.openDrift);
  const filtered = state.componentFilter === 'drift' ? withDrift : m.components;
  const selected = m.components.find((c) => c.name === state.selectedComponent);
  const isMap = state.componentMode === 'map';

  return (
    <div className="flex flex-col gap-4">
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
            { value: 'map', label: 'Map view' },
            { value: 'list', label: 'List view' },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-start gap-4">
        {isMap ? (
          <>
            <Treemap components={filtered} selected={state.selectedComponent} onSelect={actions.selectComponent} />
            {selected && (
              <Card aria-label="Components" className="min-w-0 flex-[1_1_320px] overflow-hidden">
                <ComponentDetail component={selected} />
              </Card>
            )}
          </>
        ) : (
          <ComponentTable components={filtered} selected={state.selectedComponent} onToggle={actions.toggleComponent} />
        )}
      </div>
    </div>
  );
}

/** Components as tiles whose area is the instance count. */
function Treemap({ components, selected, onSelect }: { components: ComponentRow[]; selected: string | null; onSelect: (name: string) => void }) {
  const tiles = squarify(
    components.map((c) => ({ value: c.uses, item: c })),
    MAP_WIDTH,
    MAP_HEIGHT,
  );

  return (
    <Card aria-label="Components sized by usage" className="w-170 max-w-full flex-none overflow-hidden">
      <div role="group" aria-label="Components, tile area is instance count" className="relative bg-deep" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}>
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
                'absolute flex flex-col gap-0.5 overflow-hidden border-solid bg-raised px-3 py-2.5 text-left text-meta text-fg hover:bg-raised-hover',
                'focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-white',
                on ? 'border-3 border-accent' : 'border border-line',
                drift && 'bg-drift-hatch',
              )}
              style={{ left: x, top: y, width: w, height: h }}
            >
              <strong>{c.name}</strong>
              <span className="text-micro text-muted">{formatNumber(c.uses)} uses</span>
              {drift && (
                <span className="text-xs text-drift-tag">
                  {drift.blast === 3 ? '! ' : '◆ '}
                  {BLAST_LEVELS[drift.blast].label}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="px-4 py-3 text-meta text-muted">
        Tile area is instance count. Hatching and a text label mark open drift, so colour is never the only signal.
      </p>
    </Card>
  );
}

/** Component list with the selected component's detail expanded inline below its row. */
function ComponentTable({ components, selected, onToggle }: { components: ComponentRow[]; selected: string | null; onToggle: (name: string) => void }) {
  return (
    <Card aria-label="Components" className="min-w-0 flex-[1_1_100%] overflow-hidden">
      <Table label="Components" minWidth={800}>
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
              <TableRow columns={COLUMNS} className={on ? 'bg-raised' : 'bg-surface'}>
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
                <Cell>{c.mappedLabel}</Cell>
                <Cell>{c.owner}</Cell>
                <Cell>{c.driftLabel}</Cell>
              </TableRow>
              {on && (
                <div role="row">
                  <div role="cell" className="border-y border-l-3 border-y-line border-l-accent bg-canvas">
                    <ComponentDetail component={c} />
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </Table>
      <p className="px-4 py-3 text-meta text-muted">
        Showing {components.length} of {TOTAL_COMPONENTS} components in this sample.
      </p>
    </Card>
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
          {formatNumber(c.uses)} instances. Status: {c.status}.
        </p>
      </div>

      <div className="mt-4">
        <Subheading>Example</Subheading>
        <p className="mt-0.5 text-meta opacity-70">Illustrative sample component in its main variants and states.</p>
        <div className="mt-2">
          <ComponentSample name={c.name} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6">
        <div>
          <Subheading>Usage by team</Subheading>
          <UsageBars
            className="mt-2.5"
            nameWidth={130}
            rows={m.usageByTeam(c.uses).map((t) => ({ name: t.name, count: formatNumber(t.count), share: t.share }))}
          />
          <p className="mt-2.5 text-meta text-muted">Split by each team's share of library instances in this sample.</p>
        </div>
        <div>
          <Subheading>Change history</Subheading>
          <p className="mt-2.5">
            {c.openDrift ? `${c.openDrift.summary}. Status: ${c.openDrift.status}.` : 'No changes in the last 8 weeks.'}
          </p>
          <div className="mt-2.5">
            <SourceLinks onOpen={() => actions.notify('Source links are not connected in the prototype.')} />
          </div>
        </div>
      </div>
    </div>
  );
}
