import type { ReactNode } from 'react';
import { Button } from '../components/ui/Button';
import { Card, Lead, SectionHeading } from '../components/ui/Card';
import { Legend, LegendItem, Swatch } from '../components/ui/Legend';
import { NumberField } from '../components/ui/NumberField';
import { ToggleGroup } from '../components/ui/Toggle';
import { BLAST_LEVELS, WEEKLY_REUSE } from '../data/workspace';
import { formatNumber, percent } from '../lib/format';
import { hoursSaved } from '../lib/metrics';
import { usePulse } from '../state/PulseContext';
import type { Assumptions, Period } from '../types';

const PERIOD_LABELS: Record<Period, string> = { '8w': 'Last 8 weeks', '13w': 'Last 13 weeks' };

const ASSUMPTION_FIELDS: { key: keyof Assumptions; label: string }[] = [
  { key: 'buildLow', label: 'Hours to build, low' },
  { key: 'buildHigh', label: 'Hours to build, high' },
  { key: 'useLow', label: 'Hours to use, low' },
  { key: 'useHigh', label: 'Hours to use, high' },
];

/** The paler part of a range bar: hours the high estimate adds on top of the low one. */
const RANGE_FILL = 'bg-accent/18';

/** One column per week: solid to the low estimate, paler up to the high estimate. */
function WeeklyRange({ assumptions }: { assumptions: Assumptions }) {
  const weeks = WEEKLY_REUSE.map((reused) => hoursSaved(reused, assumptions));
  const max = Math.max(...weeks.map((w) => w.high), 1);
  const label = `Weekly hours saved over the last 8 weeks, from ${formatNumber(weeks[0].low)}–${formatNumber(weeks[0].high)} to ${formatNumber(weeks[weeks.length - 1].low)}–${formatNumber(weeks[weeks.length - 1].high)} hours.`;

  return (
    <figure className="flex flex-col gap-2">
      <div role="img" aria-label={label} className="grid h-40 items-end gap-1.5 sm:gap-3" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
        {weeks.map((w, i) => (
          <div
            key={i}
            className={`flex origin-bottom animate-rise flex-col justify-end rounded-t-[2px] motion-reduce:animate-none ${RANGE_FILL}`}
            style={{ height: `${(w.high / max) * 100}%`, animationDelay: `${i * 40}ms` }}
          >
            <span className="block rounded-t-[2px] bg-accent/45" style={{ height: `${(w.low / w.high) * 100}%` }} />
          </div>
        ))}
      </div>
      <figcaption className="flex justify-between text-meta text-muted">
        <span>8 weeks ago</span>
        <span>This week</span>
      </figcaption>
    </figure>
  );
}

function SummaryLine({ question, children }: { question: string; children: ReactNode }) {
  return (
    <div className="border-b border-line py-3">
      <p className="text-meta text-muted">{question}</p>
      <p className="mt-0.5 font-semibold">{children}</p>
    </div>
  );
}

export function ImpactView() {
  const { state, metrics: m, actions } = usePulse();
  const a = state.assumptions;
  const periodLabel = PERIOD_LABELS[state.period].toLowerCase();
  const hours = `${formatNumber(m.hoursForPeriod.low)} to ${formatNumber(m.hoursForPeriod.high)}`;

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="hours" className="flex flex-col gap-4">
        <Lead id="hours">
          The library saved an estimated {hours} hours in the {periodLabel}.
        </Lead>
        <ToggleGroup<Period>
          label="Period"
          value={state.period}
          onChange={actions.setPeriod}
          options={(Object.keys(PERIOD_LABELS) as Period[]).map((p) => ({ value: p, label: PERIOD_LABELS[p] }))}
        />
        <WeeklyRange assumptions={a} />
        <Legend className="text-meta">
          <LegendItem mark="library">Low estimate</LegendItem>
          <span className="inline-flex min-h-8 items-center gap-2">
            <Swatch className={RANGE_FILL} />
            Up to the high estimate
          </span>
          <span className="text-muted">Weekly, last 8 weeks.</span>
        </Legend>
      </section>

      <div className="grid items-start gap-8 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section aria-labelledby="assumptions">
          <SectionHeading
            id="assumptions"
            title="How it is worked out"
            description="Saved hours = reused instances × (hours to build − hours to use)."
          />
          <p className="mt-2 max-w-160">
            In the {periodLabel}, {formatNumber(m.reusedForPeriod)} library instances were reused instead of rebuilt.
          </p>
          <p className="mt-4 text-meta text-muted">
            These are defaults. Edit them to match your team. The low end pairs low build time with high use time.
          </p>
          <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-3">
            {ASSUMPTION_FIELDS.map(({ key, label }) => (
              <NumberField key={key} label={label} value={a[key]} onChange={(v) => actions.setAssumption(key, v)} />
            ))}
          </div>
          <Button className="mt-4" onClick={actions.resetAssumptions}>
            Reset to defaults
          </Button>
        </section>

        <Card className="min-w-0 p-6 @3xl:p-7" aria-labelledby="summary">
          <p className="text-meta text-muted">Preview of what leadership sees</p>
          <h2 id="summary" className="mt-1 text-2xl">
            Design system summary
          </h2>
          <p className="mt-0.5 text-muted">{PERIOD_LABELS[state.period]}, sample workspace</p>

          <div className="mt-4 border-t border-line">
            <SummaryLine question="Is it used?">
              {percent(m.adoption)} adoption, {percent(m.coverage)} coverage. {m.adoptionTrendText}
            </SummaryLine>
            <SummaryLine question="Where is it drifting?">
              {m.openDrift.length} open drift items: {m.blastSummary}
            </SummaryLine>
            <SummaryLine question="What does it save?">
              {hours} hours, {periodLabel}. An estimate, with the assumptions below.
            </SummaryLine>
          </div>

          <h3 className="mt-5 text-[15px] font-semibold tracking-normal">Top three risks</h3>
          <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5">
            {m.rankedOpen.slice(0, 3).map((d) => (
              <li key={d.id}>
                <strong>{d.component}</strong>: {d.summary}. {BLAST_LEVELS[d.blast].label}, {formatNumber(d.usage)} uses.
              </li>
            ))}
          </ol>

          <h3 className="mt-5 text-[15px] font-semibold tracking-normal">Assumptions</h3>
          <p className="mt-1.5 text-muted">
            Building an equivalent custom element takes {a.buildLow} to {a.buildHigh} hours. Using the library component takes{' '}
            {a.useLow} to {a.useHigh} hours. The low end pairs low build time with high use time.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button variant="primary" onClick={() => actions.notify('Link copied. This is a prototype, so nothing was copied.')}>
              Copy link
            </Button>
            <Button onClick={() => actions.notify('PDF export is not part of the prototype.')}>Download PDF</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
