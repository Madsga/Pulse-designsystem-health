import { DriftSample } from '../components/samples/DriftSample';
import { BlastTag } from '../components/ui/BlastTag';
import { Button, SourceLinks } from '../components/ui/Button';
import { Card, EmptyCard, Eyebrow, Subheading } from '../components/ui/Card';
import { UsageBars } from '../components/ui/Data';
import { ToggleButton, ToggleGroup } from '../components/ui/Toggle';
import { BLAST_LEVELS, BLAST_ORDER, DRIFT_STATUSES } from '../data/workspace';
import { cn } from '../lib/cn';
import { formatNumber } from '../lib/format';
import { isOpenDrift, rankDrift } from '../lib/metrics';
import { usePulse } from '../state/PulseContext';
import type { DriftItem, DriftView as DriftViewFilter } from '../types';

const uses = (d: DriftItem) => `${formatNumber(d.usage)} uses`;

export function DriftView() {
  const { state, metrics: m, actions } = usePulse();
  const items = m.driftItems;
  const openCount = m.openDrift.length;

  const shown = rankDrift(
    items.filter((d) => (state.driftView === 'all' ? true : state.driftView === 'open' ? isOpenDrift(d) : !isOpenDrift(d))),
  );
  const selected = items.find((d) => d.id === state.selectedDrift);

  return (
    <div className="flex flex-col gap-4">
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

      <div className="flex flex-wrap items-start gap-4">
        <section aria-label="Drift items" className="min-w-0 max-w-95 flex-[1_1_300px]">
          {shown.length === 0 ? (
            <EmptyCard title="No drift items here">
              Every item in this view has been resolved or accepted. Switch the filter to see the rest.
            </EmptyCard>
          ) : (
            <div className="flex flex-col gap-2.5">
              {shown.map((d) => (
                <DriftListItem key={d.id} item={d} selected={d.id === state.selectedDrift} onSelect={() => actions.selectDrift(d.id)} />
              ))}
            </div>
          )}
        </section>

        <aside aria-label="Drift item detail" className="min-w-0 flex-[2_1_420px]">
          {selected ? (
            <DriftDetail item={selected} />
          ) : (
            <EmptyCard title="Select an item">
              See what differs across Figma, Storybook and code, and decide what to do about it.
            </EmptyCard>
          )}
        </aside>

        <aside aria-label="Context" className="min-w-0 flex-[1_1_240px]">
          {selected && (
            <Card as="div" className="p-5">
              <Eyebrow>Usage by team</Eyebrow>
              <UsageBars
                className="mt-2.5 text-meta"
                nameWidth={96}
                rounded={false}
                rows={m.usageByTeam(selected.usage).map((t) => ({ name: t.name, count: formatNumber(t.count), share: t.share }))}
              />
              <Eyebrow className="mt-5.5">History</Eyebrow>
              <ul className="mt-2.5 flex list-disc flex-col gap-1.5 pl-4.5 text-meta">
                <li>{selected.status === 'New' ? 'Today 06:00 · Detected in the daily scan' : `Status set to ${selected.status}`}</li>
                <li>Blast radius suggested from {selected.usage} uses</li>
              </ul>
            </Card>
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
        'block w-full rounded border px-4.5 py-4 text-left text-fg hover:bg-raised',
        selected ? 'border-accent bg-raised' : 'border-line bg-surface',
      )}
    >
      <span className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-[15px]">{item.component}</strong>
        <BlastTag level={item.blast} />
      </span>
      <span className="mt-1 block text-muted">{item.summary}</span>
      <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-meta text-muted">
        <span>{uses(item)}</span>
        <span>Status: {item.status}</span>
      </span>
    </button>
  );
}

/** One line of the Figma / Storybook / code comparison, styled like a diff. */
function DiffLine({ sign, source, value, className }: { sign: string; source: string; value: string; className: string }) {
  return (
    <div className={cn('grid grid-cols-[20px_84px_1fr] gap-2 px-3 py-2 font-mono text-meta', className)}>
      <span aria-hidden="true">{sign}</span>
      <span>{source}</span>
      <span>{value}</span>
    </div>
  );
}

function DriftDetail({ item }: { item: DriftItem }) {
  const { actions } = usePulse();
  const openSource = () => actions.notify('Source links are not connected in the prototype.');

  return (
    <Card as="div" className="flex flex-col gap-4.5 p-5">
      <div>
        <h2 className="text-xl">{item.component}</h2>
        <p className="mt-1 text-muted">{item.summary}</p>
        <p className="mt-1 text-meta text-muted">
          {uses(item)} in {item.where}
        </p>
      </div>

      <div>
        <Subheading>Example: Figma and code</Subheading>
        <p className="mt-0.5 text-meta opacity-70">Illustrative sample components. The dashed outline marks what differs.</p>
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
        <div className="mt-2 flex flex-col gap-2">
          {BLAST_ORDER.map((level) => (
            <ToggleButton key={level} pressed={item.blast === level} onClick={() => actions.setBlast(item.id, level)}>
              <span className="font-semibold">{BLAST_LEVELS[level].label}</span>
              <span className="block text-micro opacity-90">{BLAST_LEVELS[level].help}</span>
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
    </Card>
  );
}
