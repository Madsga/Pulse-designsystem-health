import { DriftSample } from '../components/samples/DriftSample';
import { BlastTag } from '../components/ui/BlastTag';
import { Button, SourceLinks } from '../components/ui/Button';
import { Card, EmptyCard, Lead, Subheading } from '../components/ui/Card';
import { UsageBars } from '../components/ui/Data';
import { MARK_FILL } from '../components/ui/Legend';
import { ToggleButton, ToggleGroup } from '../components/ui/Toggle';
import { BLAST_LEVELS, BLAST_ORDER, DRIFT_STATUSES } from '../data/workspace';
import { cn } from '../lib/cn';
import { formatNumber } from '../lib/format';
import { isOpenDrift, rankDrift } from '../lib/metrics';
import { usePulse } from '../state/PulseContext';
import type { BlastLevel, DriftItem, DriftView as DriftViewFilter } from '../types';

const uses = (d: DriftItem) => `${formatNumber(d.usage)} uses`;

/** The same cell as the Overview strip: rises with blast radius while open, settles to aligned once closed. */
const CELL_HEIGHT: Record<BlastLevel, string> = { 0: 'h-5', 1: 'h-7', 2: 'h-9', 3: 'h-12' };

function DriftCell({ item }: { item: DriftItem }) {
  const open = isOpenDrift(item);
  const fill = !open ? MARK_FILL.library : item.blast === 3 ? MARK_FILL.severe : MARK_FILL.drift;
  return <span aria-hidden="true" className={cn('w-2 rounded-[1px]', open ? CELL_HEIGHT[item.blast] : 'h-5', fill)} />;
}

export function DriftView() {
  const { state, metrics: m, actions } = usePulse();
  const items = m.driftItems;
  const openCount = m.openDrift.length;

  const shown = rankDrift(
    items.filter((d) => (state.driftView === 'all' ? true : state.driftView === 'open' ? isOpenDrift(d) : !isOpenDrift(d))),
  );
  const selected = items.find((d) => d.id === state.selectedDrift);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Lead>
          {openCount === 0
            ? 'Figma, Storybook and code agree. There is no open drift.'
            : `${openCount} open ${openCount === 1 ? 'difference' : 'differences'} between Figma, Storybook and code.`}
        </Lead>
        <ToggleGroup<DriftViewFilter>
          label="Filter drift items"
          value={state.driftView}
          onChange={actions.setDriftView}
          options={[
            { value: 'open', label: `Open (${openCount})` },
            { value: 'closed', label: `Accepted or resolved (${items.length - openCount})` },
            { value: 'all', label: `All (${items.length})` },
          ]}
        />
      </div>

      <div className="grid items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)]">
        <section aria-label="Drift items, ranked by blast radius then usage" className="min-w-0">
          {shown.length === 0 ? (
            <EmptyCard title="No drift items here">
              {state.driftView === 'open'
                ? 'Every item has been resolved or accepted. Switch the filter to see them.'
                : 'Nothing has been accepted or resolved yet. Open items are under the Open filter.'}
            </EmptyCard>
          ) : (
            <ul className="border-t border-line">
              {shown.map((d) => (
                <li key={d.id} className="border-b border-line">
                  <DriftListItem item={d} selected={d.id === state.selectedDrift} onSelect={() => actions.selectDrift(d.id)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside aria-label="Drift item detail" className="min-w-0">
          {selected ? (
            <DriftDetail item={selected} />
          ) : (
            <EmptyCard title="Select an item">
              See what differs across Figma, Storybook and code, and decide what to do about it.
            </EmptyCard>
          )}
        </aside>
      </div>
    </div>
  );
}

function DriftListItem({ item, selected, onSelect }: { item: DriftItem; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'grid w-full grid-cols-[0.5rem_minmax(0,1fr)] items-end gap-x-4 px-3 py-3.5 text-left text-fg hover:bg-raised',
        selected && 'bg-raised shadow-[inset_3px_0_0_var(--color-accent)]',
      )}
    >
      <DriftCell item={item} />
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <strong className={cn('text-[15px]', selected && 'text-accent')}>{item.component}</strong>
          <BlastTag level={item.blast} />
        </span>
        <span className="mt-1 block text-muted">{item.summary}</span>
        <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-meta text-muted">
          <span>{uses(item)}</span>
          <span>{item.status}</span>
        </span>
      </span>
    </button>
  );
}

/** One line of the Figma / Storybook / code comparison, styled like a diff. */
function DiffLine({ sign, source, value, className }: { sign: string; source: string; value: string; className: string }) {
  return (
    <div className={cn('grid grid-cols-[20px_84px_1fr] gap-2 px-3 py-2 text-meta', className)}>
      <span aria-hidden="true">{sign}</span>
      <span className="font-medium">{source}</span>
      <span>{value}</span>
    </div>
  );
}

function DriftDetail({ item }: { item: DriftItem }) {
  const { metrics: m, actions } = usePulse();
  const openSource = () => actions.notify('Source links are not connected in the prototype.');

  return (
    <Card as="div" className="flex flex-col gap-6 p-5">
      <div>
        <h2 className="text-xl">{item.component}</h2>
        <p className="mt-1">{item.summary}.</p>
        <p className="mt-1 text-meta text-muted">
          {uses(item)} in {item.where}
        </p>
      </div>

      <div>
        <Subheading>Figma and code side by side</Subheading>
        <p className="mt-0.5 text-meta text-muted">Illustrative sample components. The dashed outline marks what differs.</p>
        <DriftSample driftId={item.id} />
      </div>

      <div>
        <Subheading>What differs</Subheading>
        <div className="mt-2 overflow-hidden rounded border border-line">
          <DiffLine sign="−" source="Figma" value={item.figma} className="bg-removed-bg text-removed-fg" />
          <DiffLine sign="~" source="Storybook" value={item.storybook} className="bg-raised text-changed-fg" />
          <DiffLine sign="+" source="Code" value={item.code} className="bg-added-bg text-added-fg" />
        </div>
        <div className="mt-1">
          <SourceLinks onOpen={openSource} />
        </div>
      </div>

      <div>
        <Subheading>Blast radius</Subheading>
        <p className="mt-0.5 text-meta text-muted">Pulse suggests a level from usage. You can change it.</p>
        <div role="group" aria-label="Blast radius" className="mt-2 grid gap-2 @3xl:grid-cols-2">
          {BLAST_ORDER.map((level) => (
            <ToggleButton key={level} pressed={item.blast === level} className="py-2.5" onClick={() => actions.setBlast(item.id, level)}>
              <BlastTag level={level} />
              <span className="mt-0.5 block text-micro text-muted">{BLAST_LEVELS[level].help}</span>
            </ToggleButton>
          ))}
        </div>
      </div>

      <div>
        <Subheading>Status</Subheading>
        <ToggleGroup
          label="Status"
          className="mt-2"
          value={item.status}
          onChange={(status) => actions.setDriftStatus(item.id, status)}
          options={DRIFT_STATUSES.map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div>
        <Button variant="primary" onClick={() => actions.createIssue(item.id)}>
          {item.status === 'Fix requested' ? 'Issue created' : 'Create GitHub issue'}
        </Button>
        <p className="mt-2 text-meta text-muted">Pulse only opens an issue after you approve. Pull requests come in a later version.</p>
      </div>

      <div className="grid gap-6 border-t border-line pt-5 @3xl:grid-cols-2">
        <div>
          <Subheading>Usage by team</Subheading>
          <UsageBars
            className="mt-2.5 text-meta"
            nameWidth={96}
            rounded={false}
            rows={m.usageByTeam(item.usage).map((t) => ({ name: t.name, count: formatNumber(t.count), share: t.share }))}
          />
        </div>
        <div>
          <Subheading>History</Subheading>
          <ul className="mt-2.5 flex flex-col gap-1.5 text-meta">
            <li>{item.status === 'New' ? 'Today, 06:00: detected in the daily scan.' : `Status set to ${item.status}.`}</li>
            <li className="text-muted">Blast radius suggested from {formatNumber(item.usage)} uses.</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
