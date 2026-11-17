import type { ReactNode } from 'react';
import { Button } from '../components/ui/Button';
import { Card, Subheading } from '../components/ui/Card';
import { BigNumber } from '../components/ui/Data';
import { NumberField } from '../components/ui/NumberField';
import { ToggleGroup } from '../components/ui/Toggle';
import { BLAST_LEVELS } from '../data/workspace';
import { formatNumber, percent } from '../lib/format';
import { usePulse } from '../state/PulseContext';
import type { Assumptions, Period } from '../types';

const PERIOD_LABELS: Record<Period, string> = { '8w': 'Last 8 weeks', '13w': 'Last 13 weeks' };

const ASSUMPTION_FIELDS: { key: keyof Assumptions; label: string }[] = [
  { key: 'buildLow', label: 'Hours to build, low' },
  { key: 'buildHigh', label: 'Hours to build, high' },
  { key: 'useLow', label: 'Hours to use, low' },
  { key: 'useHigh', label: 'Hours to use, high' },
];

function SummaryLine({ question, children }: { question: string; children: ReactNode }) {
  return (
    <div className="border-b border-line pb-3.5">
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
    <div className="flex flex-wrap items-start gap-4">
      <Card className="flex min-w-0 flex-[1_1_340px] flex-col gap-4.5 p-5" aria-labelledby="hours">
        <div>
          <h2 id="hours" className="text-lg">
            Hours saved
          </h2>
          <p className="mt-2">
            <BigNumber>{hours}</BigNumber>
          </p>
          <p className="text-muted">hours saved, {periodLabel}</p>
        </div>

        <ToggleGroup<Period>
          label="Period"
          value={state.period}
          onChange={actions.setPeriod}
          options={(Object.keys(PERIOD_LABELS) as Period[]).map((p) => ({ value: p, label: PERIOD_LABELS[p] }))}
        />

        <div className="rounded border border-line bg-raised px-3.5 py-3">
          <p className="font-semibold">How it is worked out</p>
          <p className="mt-1 text-muted">Saved hours = reused instances × (hours to build − hours to use).</p>
          <p className="mt-1 text-muted">
            In the {periodLabel}, {formatNumber(m.reusedForPeriod)} library instances were reused instead of rebuilt.
          </p>
        </div>

        <div>
          <Subheading>Assumptions</Subheading>
          <p className="mt-0.5 text-meta text-muted">
            These are defaults. Edit them to match your team. The low end pairs low build time with high use time.
          </p>
          <div className="mt-2.5 grid grid-cols-[repeat(auto-fit,minmax(min(140px,100%),1fr))] gap-3">
            {ASSUMPTION_FIELDS.map(({ key, label }) => (
              <NumberField key={key} label={label} value={a[key]} onChange={(v) => actions.setAssumption(key, v)} />
            ))}
          </div>
          <Button className="mt-3" onClick={actions.resetAssumptions}>
            Reset to defaults
          </Button>
        </div>
      </Card>

      <Card className="min-w-0 flex-[1.4_1_420px] p-7" aria-labelledby="summary">
        <p className="text-meta text-muted">Leadership summary preview</p>
        <h2 id="summary" className="mt-1 text-2xl">
          Design system summary
        </h2>
        <p className="mt-0.5 text-muted">{PERIOD_LABELS[state.period]} · Sample workspace</p>

        <div className="mt-5 flex flex-col gap-3.5">
          <SummaryLine question="Is it used?">
            {percent(m.adoption)} adoption rate, {percent(m.coverage)} coverage. {m.adoptionTrendText}
          </SummaryLine>
          <SummaryLine question="Where is it drifting?">
            {m.openDrift.length} open drift items: {m.blastSummary}
          </SummaryLine>
          <SummaryLine question="What does it save?">
            {hours} hours, {periodLabel}. An estimate, with the assumptions below.
          </SummaryLine>
        </div>

        <h3 className="mt-5 text-[15px] font-semibold">Top three risks</h3>
        <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5">
          {m.rankedOpen.slice(0, 3).map((d) => (
            <li key={d.id}>
              <strong>{d.component}</strong>: {d.summary}. {BLAST_LEVELS[d.blast].label}, {formatNumber(d.usage)} uses.
            </li>
          ))}
        </ol>

        <h3 className="mt-5 text-[15px] font-semibold">Assumptions</h3>
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
  );
}
