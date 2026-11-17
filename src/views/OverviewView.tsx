import type { ReactNode } from 'react';
import { BlastTag } from '../components/ui/BlastTag';
import { ArrowLink, Button } from '../components/ui/Button';
import { Card, ItemRow, SectionHeading } from '../components/ui/Card';
import { BigNumber, Meter, Sparkline } from '../components/ui/Data';
import { BLAST_LEVELS } from '../data/workspace';
import { formatNumber, percent } from '../lib/format';
import { usePulse } from '../state/PulseContext';

interface QuestionCardProps {
  id: string;
  question: string;
  value: ReactNode;
  valueSize?: 40 | 56;
  unit: string;
  trend: number[];
  trendLabel: string;
  note: ReactNode;
  linkLabel: string;
  onLink: () => void;
}

/** One of the three headline questions: a number, its trend, and a way in. */
function QuestionCard({ id, question, value, valueSize = 56, unit, trend, trendLabel, note, linkLabel, onLink }: QuestionCardProps) {
  return (
    <Card className="flex flex-col gap-2.5 p-5" aria-labelledby={id}>
      <h2 id={id} className="text-[15px] font-semibold text-muted">
        {question}
      </h2>
      <div className="flex flex-wrap items-baseline gap-2">
        <BigNumber size={valueSize}>{value}</BigNumber>
        <span className="text-muted">{unit}</span>
      </div>
      <Sparkline values={trend} label={trendLabel} />
      <p className="text-muted">{note}</p>
      <ArrowLink onClick={onLink}>{linkLabel}</ArrowLink>
    </Card>
  );
}

export function OverviewView() {
  const { metrics: m, actions } = usePulse();
  const top = m.rankedOpen[0];
  const first = (arr: number[]) => arr[0];
  const last = (arr: number[]) => arr[arr.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
        <QuestionCard
          id="q-used"
          question="Is it used?"
          value={percent(m.adoption)}
          unit="adoption rate"
          trend={m.adoptionTrend}
          trendLabel={`Adoption rate over 8 weeks, from ${first(m.adoptionTrend).toFixed(1)}% to ${last(m.adoptionTrend).toFixed(1)}%`}
          note={m.adoptionTrendText}
          linkLabel="See adoption by team"
          onLink={() => actions.navigate('adoption')}
        />
        <QuestionCard
          id="q-drift"
          question="Where is it drifting?"
          value={m.openDrift.length}
          unit="open drift items"
          trend={m.driftTrend}
          trendLabel={`Open drift items over 8 weeks, from ${first(m.driftTrend)} to ${m.openDrift.length}`}
          note={m.blastSummary}
          linkLabel="Triage drift"
          onLink={() => actions.navigate('drift')}
        />
        <QuestionCard
          id="q-save"
          question="What does it save?"
          value={`${formatNumber(m.hours8w.low)} to ${formatNumber(m.hours8w.high)}`}
          valueSize={40}
          unit="hours, last 8 weeks"
          trend={m.weeklyHours}
          trendLabel={`Estimated weekly hours saved over 8 weeks, from ${formatNumber(first(m.weeklyHours))} to ${formatNumber(last(m.weeklyHours))}`}
          note="An estimate from assumptions you can edit."
          linkLabel="See assumptions and summary"
          onLink={() => actions.navigate('impact')}
        />
      </div>

      {top && (
        <section
          aria-label="Suggested next step"
          className="flex flex-wrap items-center justify-between gap-3 rounded border border-l-4 border-accent bg-deep px-5 py-4"
        >
          <div className="min-w-0">
            <p className="font-semibold">Start with {top.component}</p>
            <p className="mt-0.5">
              {top.summary}. {BLAST_LEVELS[top.blast].label}, {formatNumber(top.usage)} uses.
            </p>
          </div>
          <Button variant="primary" onClick={() => actions.openDriftItem(top.id)}>
            Review
          </Button>
        </section>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] items-start gap-4">
        <Card className="p-5" aria-labelledby="health">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="health" className="text-lg">
              Health score
            </h2>
            <p>
              <BigNumber size={32}>{m.healthScore}</BigNumber>
              <span className="text-muted"> out of 100</span>
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3.5">
            {m.healthInputs.map((r) => (
              <div key={r.name} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                <span>
                  {r.name} <span className="text-meta text-muted">weight {r.weight}</span>
                </span>
                <span className="font-semibold">{percent(r.value)}</span>
                <Meter value={r.value} className="col-span-full" />
              </div>
            ))}
          </div>
          <p className="mt-4 text-meta text-muted">
            The score is a prompt for a conversation, not a grade. Select an input to see what moved it.
          </p>
        </Card>

        <Card className="p-5" aria-labelledby="attention">
          <SectionHeading id="attention" title="Needs attention" description="The open drift items that reach furthest." />
          <div className="mt-4 flex flex-col gap-2.5">
            {m.rankedOpen.slice(0, 3).map((d) => (
              <ItemRow key={d.id}>
                <div className="min-w-0">
                  <p className="font-semibold">{d.component}</p>
                  <p className="text-meta text-muted">{d.summary}</p>
                  <BlastTag level={d.blast} className="mt-1.5" />
                </div>
                <Button onClick={() => actions.openDriftItem(d.id)}>Review</Button>
              </ItemRow>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
