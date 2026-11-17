import { Button } from '../components/ui/Button';
import { Card, ItemRow, ItemText, SectionHeading } from '../components/ui/Card';
import { Cell, HeaderCell, Table, TableRow } from '../components/ui/Data';
import { ROLES, SOURCES } from '../data/workspace';
import { usePulse } from '../state/PulseContext';

const MAPPING_COLUMNS = '1fr 1fr 1fr';

export function SettingsView() {
  const { state, metrics: m, actions } = usePulse();

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5" aria-labelledby="sources">
        <SectionHeading id="sources" title="Sources" description="Pulse reads these sources. It writes back only when you approve an action." />
        <div className="mt-4 flex flex-col gap-2.5">
          {SOURCES.map((s) => (
            <ItemRow key={s.name}>
              <ItemText title={s.name} detail={s.scope} />
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-meta font-medium">Connected</span>
                <Button onClick={() => actions.notify('Source settings are not part of the prototype.')}>Manage</Button>
              </div>
            </ItemRow>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] items-start gap-4">
        <Card className="overflow-hidden" aria-labelledby="mapping">
          <SectionHeading
            id="mapping"
            title="Team mapping"
            description="Teams come from a repository folder and a Figma project."
            className="px-5 pt-5 pb-3"
          />
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
        </Card>

        <Card className="overflow-hidden" aria-labelledby="roles">
          <SectionHeading
            id="roles"
            title="Roles"
            description="Data is shown by team and product, not by person."
            className="px-5 pt-5 pb-3"
          />
          <div className="flex flex-col">
            {ROLES.map((r) => (
              <div key={r.name} className="border-t border-line px-5 py-3">
                <ItemText title={r.name} detail={r.can} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden" aria-labelledby="audit">
        <SectionHeading
          id="audit"
          title="Audit log"
          description="Every write is recorded. Actions you take in this prototype appear at the top."
          className="px-5 pt-5 pb-3"
        />
        <div className="flex flex-col">
          {state.audit.map((e, i) => (
            <div key={`${i}-${e.what}`} className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-5 py-3">
              <span className="min-w-27.5 text-muted">{e.when}</span>
              <span className="min-w-27.5 font-medium">{e.who}</span>
              <span>{e.what}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
