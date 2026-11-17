import { Button } from '../components/ui/Button';
import { Lead, SectionHeading } from '../components/ui/Card';
import { Cell, HeaderCell, Table, TableRow } from '../components/ui/Data';
import { Legend, LegendItem, MARK_FILL, Swatch } from '../components/ui/Legend';
import { CUSTOM_UI } from '../data/workspace';
import { cn } from '../lib/cn';
import { classificationOf } from '../lib/metrics';
import { formatNumber, percent } from '../lib/format';
import { usePulse } from '../state/PulseContext';

interface Composition {
  library: number;
  ignored: number;
  missing: number;
}

/** All component-like UI split into library, ignored (a match exists) and missing (no match). */
function CompositionBar({ library, ignored, missing, label, size }: Composition & { label: string; size: 'lead' | 'row' }) {
  const total = library + ignored + missing;
  const parts = [
    { key: 'library', value: library, fill: MARK_FILL.library },
    { key: 'ignored', value: ignored, fill: MARK_FILL.gap },
    { key: 'missing', value: missing, fill: MARK_FILL.absent },
  ];
  return (
    <div role="img" aria-label={label} className={cn('flex w-full gap-0.5', size === 'lead' ? 'h-14' : 'h-3')}>
      {parts.map((p) => (
        <span
          key={p.key}
          className={cn(
            'rounded-[1px]',
            p.fill,
            size === 'lead' && 'origin-bottom animate-rise motion-reduce:animate-none',
          )}
          style={{ width: `${(p.value / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

const compositionLabel = (c: Composition) =>
  `${formatNumber(c.library)} library instances, ${formatNumber(c.ignored)} custom with a library match, ${formatNumber(c.missing)} custom with no match.`;

const TEAM_COLUMNS = 'minmax(130px,1fr) minmax(200px,2.4fr) 72px 88px 88px 88px';

export function AdoptionView() {
  const { state, metrics: m, actions } = usePulse();
  const teamName = (id: string) => m.teams.find((t) => t.id === id)?.name;
  const rate = (t: Composition) => t.library / (t.library + t.ignored + t.missing);
  const teams = [...m.teams].sort((a, b) => rate(b) - rate(a));

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="adoption-lead" className="flex flex-col gap-4">
        <Lead id="adoption-lead">{percent(m.adoption)} of the component-like UI in your products comes from the library.</Lead>
        <CompositionBar size="lead" {...m.totals} label={compositionLabel(m.totals)} />
        <Legend>
          <LegendItem mark="library">{formatNumber(m.totals.library)} library instances</LegendItem>
          <LegendItem mark="gap">{formatNumber(m.totals.ignored)} custom, although the library has a match</LegendItem>
          <LegendItem mark="absent">{formatNumber(m.totals.missing)} custom, with no library match</LegendItem>
        </Legend>
        <p className="max-w-160 text-muted">
          The library covers {percent(m.coverage)} of what teams build. Hatched UI is adoption still to win; outlined UI is a
          gap in the library.
        </p>
      </section>

      <section aria-labelledby="by-team">
        <SectionHeading id="by-team" title="By team and product" description="Highest adoption first." />
        <div className="mt-4">
          <Table label="Adoption by team and product" minWidth={680}>
            <TableRow columns={TEAM_COLUMNS}>
              <HeaderCell>Team or product</HeaderCell>
              <HeaderCell>Breakdown</HeaderCell>
              <HeaderCell>Adoption</HeaderCell>
              <HeaderCell>Library</HeaderCell>
              <HeaderCell>Ignored</HeaderCell>
              <HeaderCell>Missing</HeaderCell>
            </TableRow>
            {teams.map((t) => (
              <TableRow key={t.id} columns={TEAM_COLUMNS}>
                <Cell className="font-semibold">{t.name}</Cell>
                <Cell>
                  <CompositionBar size="row" {...t} label={`${t.name}: ${compositionLabel(t)}`} />
                </Cell>
                <Cell className="font-semibold">{percent(rate(t))}</Cell>
                <Cell>{formatNumber(t.library)}</Cell>
                <Cell>{formatNumber(t.ignored)}</Cell>
                <Cell>{formatNumber(t.missing)}</Cell>
              </TableRow>
            ))}
          </Table>
        </div>
      </section>

      <section aria-labelledby="review">
        <SectionHeading
          id="review"
          title="Custom UI to review"
          description="Ignored means a library component already exists, so the team may need support. Missing means the library has no match, so the system may need a new component. Your call is kept across scans and logged."
        />
        <ul className="mt-4 border-t border-line">
          {CUSTOM_UI.map((r) => {
            const isIgnored = classificationOf(r.id, state.customUiOverrides) === 'ignored';
            return (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3.5">
                <div className="flex min-w-0 items-baseline gap-3">
                  <Swatch mark={isIgnored ? 'gap' : 'absent'} className="translate-y-px" />
                  <div className="min-w-0">
                    <p>
                      <span className="font-semibold">{r.name}</span> <span className="text-muted">in {teamName(r.teamId)}</span>
                    </p>
                    <p className="text-meta text-muted">{r.match}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pl-5 sm:pl-0">
                  <span className="text-meta font-medium">{isIgnored ? 'Ignored' : 'Missing'}</span>
                  <Button onClick={() => actions.flipCustomUi(r.id)}>{isIgnored ? 'Mark as missing' : 'Mark as ignored'}</Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
