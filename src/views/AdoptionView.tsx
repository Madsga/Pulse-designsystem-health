import { Button } from '../components/ui/Button';
import { Card, ItemRow, SectionHeading } from '../components/ui/Card';
import { BigNumber, Cell, HeaderCell, Meter, Table, TableRow } from '../components/ui/Data';
import { CUSTOM_UI } from '../data/workspace';
import { classificationOf } from '../lib/metrics';
import { formatNumber, percent, percentOneDecimal } from '../lib/format';
import { usePulse } from '../state/PulseContext';

function MetricCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <Card className="p-5">
      <p className="text-meta text-muted">{label}</p>
      <p className="mt-1">
        <BigNumber>{value}</BigNumber>
      </p>
      <p className="mt-1 text-muted">{description}</p>
    </Card>
  );
}

const TEAM_COLUMNS = 'minmax(150px,1.2fr) minmax(220px,2fr) 110px 110px 110px';

export function AdoptionView() {
  const { state, metrics: m, actions } = usePulse();
  const teamName = (id: string) => m.teams.find((t) => t.id === id)?.name;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
        <MetricCard label="Adoption rate" value={percent(m.adoption)} description="Library instances out of all component-like UI." />
        <MetricCard label="Coverage" value={percent(m.coverage)} description="UI patterns in use that have a matching library component." />
        <MetricCard
          label="Custom UI"
          value={formatNumber(m.totals.ignored + m.totals.missing)}
          description={`${formatNumber(m.totals.ignored)} ignored although a match exists. ${formatNumber(m.totals.missing)} missing from the library.`}
        />
      </div>

      <Card className="overflow-hidden" aria-labelledby="by-team">
        <SectionHeading id="by-team" title="Adoption by team and product" className="px-5 pt-5 pb-3" />
        <Table label="Adoption by team and product" minWidth={720}>
          <TableRow columns={TEAM_COLUMNS}>
            <HeaderCell>Team or product</HeaderCell>
            <HeaderCell>Adoption rate</HeaderCell>
            <HeaderCell>Library</HeaderCell>
            <HeaderCell>Ignored</HeaderCell>
            <HeaderCell>Missing</HeaderCell>
          </TableRow>
          {m.teams.map((t) => {
            const rate = t.library / (t.library + t.ignored + t.missing);
            return (
              <TableRow key={t.id} columns={TEAM_COLUMNS}>
                <Cell className="font-semibold">{t.name}</Cell>
                <Cell>
                  <div className="flex w-full items-center gap-2.5">
                    <Meter value={rate} className="flex-1" />
                    <span className="min-w-13 font-semibold">{percentOneDecimal(rate)}</span>
                  </div>
                </Cell>
                <Cell>{formatNumber(t.library)}</Cell>
                <Cell>{formatNumber(t.ignored)}</Cell>
                <Cell>{formatNumber(t.missing)}</Cell>
              </TableRow>
            );
          })}
        </Table>
      </Card>

      <Card className="p-5" aria-labelledby="review">
        <SectionHeading
          id="review"
          title="Custom UI to review"
          description={
            <span className="block max-w-180">
              Ignored means a library component already exists, so the team may need support. Missing means the library has
              no match, so the system may need a new component. Your override is kept across scans and logged.
            </span>
          }
        />
        <div className="mt-4 flex flex-col gap-2.5">
          {CUSTOM_UI.map((r) => {
            const isIgnored = classificationOf(r.id, state.customUiOverrides) === 'ignored';
            return (
              <ItemRow key={r.id}>
                <div className="min-w-0">
                  <p className="font-semibold">
                    {r.name} <span className="font-normal text-muted">in {teamName(r.teamId)}</span>
                  </p>
                  <p className="text-meta text-muted">{r.match}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-meta font-medium">{isIgnored ? 'Ignored' : 'Missing'}</span>
                  <Button onClick={() => actions.flipCustomUi(r.id)}>{isIgnored ? 'Mark as missing' : 'Mark as ignored'}</Button>
                </div>
              </ItemRow>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
