import { Button } from '../components/ui/Button';
import { Lead, SectionHeading } from '../components/ui/Card';
import { Cell, HeaderCell, Table, TableRow } from '../components/ui/Data';
import { Swatch } from '../components/ui/Legend';
import { ROLES, SOURCES } from '../data/workspace';
import { usePulse } from '../state/PulseContext';

const MAPPING_COLUMNS = '1fr 1fr 1fr';

export function SettingsView() {
  const { state, metrics: m, actions } = usePulse();

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="sources" className="flex flex-col gap-4">
        <Lead>
          Pulse reads from {SOURCES.length} sources and writes back only after you approve.
        </Lead>
        <h2 id="sources" className="sr-only">
          Sources
        </h2>
        <ul className="border-t border-line">
          {SOURCES.map((s) => (
            <li key={s.name} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3.5">
              <div className="min-w-0">
                <p className="font-semibold">{s.name}</p>
                <p className="text-meta text-muted">{s.scope}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 text-meta font-medium">
                  <Swatch mark="library" />
                  Connected
                </span>
                <Button onClick={() => actions.notify('Source settings are not part of the prototype.')}>Manage</Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid items-start gap-8 @4xl:grid-cols-2">
        <section aria-labelledby="mapping" className="min-w-0">
          <SectionHeading id="mapping" title="Team mapping" description="Teams come from a repository folder and a Figma project." />
          <div className="mt-3">
            <Table label="Team mapping" minWidth={420}>
              <TableRow columns={MAPPING_COLUMNS}>
                <HeaderCell>Team or product</HeaderCell>
                <HeaderCell>Repository folder</HeaderCell>
                <HeaderCell>Figma project</HeaderCell>
              </TableRow>
              {m.teams.map((t) => (
                <TableRow key={t.id} columns={MAPPING_COLUMNS}>
                  <Cell className="font-semibold">{t.name}</Cell>
                  <Cell>{t.repo}</Cell>
                  <Cell>{t.figmaProject}</Cell>
                </TableRow>
              ))}
            </Table>
          </div>
        </section>

        <section aria-labelledby="roles" className="min-w-0">
          <SectionHeading id="roles" title="Roles" description="Data is shown by team and product, not by person." />
          <dl className="mt-3 border-t border-line">
            {ROLES.map((r) => (
              <div key={r.name} className="border-b border-raised py-3">
                <dt className="font-semibold">{r.name}</dt>
                <dd className="text-meta text-muted">{r.can}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section aria-labelledby="audit">
        <SectionHeading
          id="audit"
          title="Audit log"
          description="Every write is recorded. Actions you take in this prototype appear at the top."
        />
        <ol className="mt-3 border-t border-line">
          {state.audit.map((e, i) => (
            <li key={`${i}-${e.what}`} className="grid gap-x-4 gap-y-0.5 border-b border-raised py-3 sm:grid-cols-[8rem_8rem_minmax(0,1fr)]">
              <span className="text-muted">{e.when}</span>
              <span className="font-medium">{e.who}</span>
              <span>{e.what}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
