import type { CSSProperties, ReactNode } from 'react';
import { BlastTag } from '../components/ui/BlastTag';
import { Button } from '../components/ui/Button';
import { Card, Lead } from '../components/ui/Card';
import { LegendItem, MARK_FILL, Swatch } from '../components/ui/Legend';
import { BigNumber, Sparkline } from '../components/ui/Data';
import { MAPPED_COMPONENTS, TOTAL_COMPONENTS } from '../data/workspace';
import { cn } from '../lib/cn';
import { formatNumber, percent } from '../lib/format';
import type { HealthInput } from '../lib/metrics';
import { usePulse } from '../state/PulseContext';
import type { BlastLevel } from '../types';

/* ── Library strip: one cell per component, the page's lead ── */

type Cell = { kind: 'aligned' } | { kind: 'unmapped' } | { kind: 'drift'; blast: BlastLevel };

const CELL_BASE = 'h-7 rounded-[1px] origin-bottom animate-rise motion-reduce:animate-none';
/** Drift cells rise with blast radius: the further a difference reaches, the taller it stands. */
const DRIFT_HEIGHT: Record<BlastLevel, string> = { 0: 'h-7', 1: 'h-9', 2: 'h-11', 3: 'h-14' };

function cellClass(c: Cell) {
  if (c.kind === 'aligned') return cn(CELL_BASE, MARK_FILL.library);
  if (c.kind === 'unmapped') return cn(CELL_BASE, MARK_FILL.absent);
  return cn(CELL_BASE, DRIFT_HEIGHT[c.blast], c.blast === 3 ? MARK_FILL.severe : MARK_FILL.drift);
}

function LibraryStrip({ cells, label }: { cells: Cell[]; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="grid h-14 items-end gap-px sm:gap-0.5"
      style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
    >
      {cells.map((c, i) => (
        <span key={i} className={cellClass(c)} style={{ animationDelay: `${i * 7}ms` } as CSSProperties} />
      ))}
    </div>
  );
}

/* ── The three questions, as one ruled table ── */

interface AnswerProps {
  id: string;
  question: string;
  value: ReactNode;
  unit: string;
  trend: number[];
  trendLabel: string;
  note: ReactNode;
  linkLabel: string;
  onLink: () => void;
}

function Answer({ id, question, value, unit, trend, trendLabel, note, linkLabel, onLink }: AnswerProps) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2 px-5 py-5">
      <div className="flex items-start justify-between gap-4">
        <h3 id={id} className="text-[15px] font-semibold tracking-normal text-muted">
          {question}
        </h3>
        <Sparkline values={trend} label={trendLabel} width={88} height={28} />
      </div>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <BigNumber size={40}>{value}</BigNumber>
        <span className="text-muted">{unit}</span>
      </p>
      <p className="text-muted">{note}</p>
      <Button variant="link" className="mt-auto self-start" onClick={onLink}>
        {linkLabel}
      </Button>
    </section>
  );
}

/* ── Health score as earned points ── */

/** Split the score across inputs by weight × value, rounding so the parts add up to the score. */
function earnedPoints(inputs: HealthInput[], score: number) {
  const exact = inputs.map((r) => parseFloat(r.weight) * r.value);
  const points = exact.map(Math.floor);
  let left = score - points.reduce((n, p) => n + p, 0);
  const byRemainder = exact.map((e, i) => [e - Math.floor(e), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of byRemainder) {
    if (left <= 0) break;
    points[i] += 1;
    left -= 1;
  }
  return points;
}

/** Opaque shades of the accent (mixed into the surface so the hatching never shows through), strongest for the heaviest weight. */
const INPUT_SHADES = [
  'bg-accent',
  'bg-[color-mix(in_srgb,var(--color-accent)_72%,var(--color-surface))]',
  'bg-[color-mix(in_srgb,var(--color-accent)_50%,var(--color-surface))]',
  'bg-[color-mix(in_srgb,var(--color-accent)_32%,var(--color-surface))]',
];

export function OverviewView() {
  const { metrics: m, actions } = usePulse();
  const first = (arr: number[]) => arr[0];
  const last = (arr: number[]) => arr[arr.length - 1];

  const drifting = m.openDrift.length;
  const unmapped = TOTAL_COMPONENTS - MAPPED_COMPONENTS;
  const aligned = Math.max(0, TOTAL_COMPONENTS - drifting - unmapped);
  const cells: Cell[] = [
    ...Array.from({ length: aligned }, (): Cell => ({ kind: 'aligned' })),
    ...Array.from({ length: unmapped }, (): Cell => ({ kind: 'unmapped' })),
    ...[...m.rankedOpen].reverse().map((d): Cell => ({ kind: 'drift', blast: d.blast })),
  ];

  const queue = m.rankedOpen.slice(0, 3);
  const points = earnedPoints(m.healthInputs, m.healthScore);

  return (
    <div className="flex flex-col gap-8">
      {/* Lead: the whole library at a glance */}
      <section aria-labelledby="library" className="flex flex-col gap-4">
        <Lead id="library">
          {aligned} of {TOTAL_COMPONENTS} components match across Figma, Storybook and code.
        </Lead>
        <LibraryStrip
          cells={cells}
          label={`${aligned} components aligned, ${unmapped} not mapped in all three sources, ${drifting} with open drift.`}
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <LegendItem mark="library">{aligned} aligned</LegendItem>
          <Button variant="link" className="inline-flex items-center gap-2" onClick={() => actions.navigate('components')}>
            <Swatch mark="absent" />
            {unmapped} not in all three sources
          </Button>
          <Button variant="link" className="inline-flex items-center gap-2" onClick={() => actions.navigate('drift')}>
            <Swatch mark="drift" />
            {drifting} with open drift, taller where it reaches further
          </Button>
        </div>
      </section>

      {/* The three questions */}
      <Card aria-label="Three questions" className="grid divide-y divide-line @3xl:grid-cols-3 @3xl:divide-x @3xl:divide-y-0">
        <Answer
          id="q-used"
          question="Is it used?"
          value={percent(m.adoption)}
          unit="adoption"
          trend={m.adoptionTrend}
          trendLabel={`Adoption rate over 8 weeks, from ${first(m.adoptionTrend).toFixed(1)}% to ${last(m.adoptionTrend).toFixed(1)}%`}
          note={m.adoptionTrendText}
          linkLabel="See adoption by team"
          onLink={() => actions.navigate('adoption')}
        />
        <Answer
          id="q-drift"
          question="Where is it drifting?"
          value={drifting}
          unit="open items"
          trend={m.driftTrend}
          trendLabel={`Open drift items over 8 weeks, from ${first(m.driftTrend)} to ${drifting}`}
          note={m.blastSummary}
          linkLabel="Triage drift"
          onLink={() => actions.navigate('drift')}
        />
        <Answer
          id="q-save"
          question="What does it save?"
          value={`${formatNumber(m.hours8w.low)}–${formatNumber(m.hours8w.high)}`}
          unit="hours in 8 weeks"
          trend={m.weeklyHours}
          trendLabel={`Estimated weekly hours saved over 8 weeks, from ${formatNumber(first(m.weeklyHours))} to ${formatNumber(last(m.weeklyHours))}`}
          note="An estimate from assumptions you can edit."
          linkLabel="See assumptions"
          onLink={() => actions.navigate('impact')}
        />
      </Card>

      <div className="grid items-start gap-8 @4xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* Ranked drift queue */}
        <section aria-labelledby="start">
          <h2 id="start" className="text-lg">
            Start here
          </h2>
          <p className="mt-1 text-muted">Open drift, ranked by how far each difference reaches, then by usage.</p>

          {queue.length === 0 ? (
            <p className="mt-4 border-t border-line pt-4">
              No open drift. New differences appear here after the next scan.
            </p>
          ) : (
            <ol className="mt-4 border-t border-line">
              {queue.map((d, i) => (
                <li
                  key={d.id}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-line py-4 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center"
                >
                  <span aria-hidden="true" className="text-[22px] leading-none font-medium text-muted">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-semibold">{d.component}</span>
                      <BlastTag level={d.blast} />
                    </p>
                    <p className="mt-1">{d.summary}.</p>
                    <p className="mt-0.5 text-meta text-muted">
                      {formatNumber(d.usage)} uses in {d.where}
                    </p>
                  </div>
                  <Button
                    variant={i === 0 ? 'primary' : 'secondary'}
                    className="col-start-2 justify-self-start sm:col-start-3"
                    aria-label={`Review ${d.component}`}
                    onClick={() => actions.openDriftItem(d.id)}
                  >
                    Review
                  </Button>
                </li>
              ))}
            </ol>
          )}
          {drifting > queue.length && (
            <Button variant="link" className="mt-2" onClick={() => actions.navigate('drift')}>
              See all {drifting} open items
            </Button>
          )}
        </section>

        {/* Health score */}
        <Card className="p-5" aria-labelledby="health">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="health" className="text-lg">
              Health score
            </h2>
            <p>
              <BigNumber size={40}>{m.healthScore}</BigNumber>
              <span className="text-muted"> of 100</span>
            </p>
          </div>

          <div
            role="img"
            aria-label={`${m.healthScore} of 100 points earned, ${100 - m.healthScore} still to gain.`}
            className="bg-hatched mt-4 flex h-3 gap-0.5 overflow-hidden rounded-xs"
          >
            {points.map((p, i) => (
              <span key={m.healthInputs[i].name} className={INPUT_SHADES[i]} style={{ width: `${p}%` }} />
            ))}
          </div>

          <dl className="mt-4 flex flex-col">
            {m.healthInputs.map((r, i) => (
              <div key={r.name} className="flex items-baseline justify-between gap-3 border-b border-raised py-2 last:border-0">
                <dt className="flex items-baseline gap-2">
                  <Swatch className={cn(INPUT_SHADES[i], 'translate-y-px')} />
                  <span>
                    {r.name} <span className="text-meta text-muted">{percent(r.value)}</span>
                  </span>
                </dt>
                <dd className="whitespace-nowrap">
                  <span className="font-semibold">{points[i]}</span>
                  <span className="text-muted"> of {parseFloat(r.weight)}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-meta text-muted">
            Each input earns up to its weight in points. The hatched part is what is left to gain. Use the score to start a
            conversation, not as a grade.
          </p>
        </Card>
      </div>
    </div>
  );
}
