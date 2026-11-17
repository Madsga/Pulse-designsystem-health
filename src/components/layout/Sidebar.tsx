import { cn } from '../../lib/cn';
import { usePulse } from '../../state/PulseContext';
import type { Screen } from '../../types';

const NAV: { id: Screen; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'adoption', label: 'Adoption' },
  { id: 'drift', label: 'Drift' },
  { id: 'components', label: 'Components' },
  { id: 'impact', label: 'Impact' },
  { id: 'settings', label: 'Settings' },
];

export function Sidebar() {
  const { state, metrics, actions } = usePulse();

  return (
    <nav
      aria-label="Main"
      className="flex h-screen max-w-full flex-[1_1_232px] flex-col gap-6 border-r border-raised bg-deep px-4 py-5"
    >
      <div>
        <h2 className="text-[22px]">Pulse</h2>
        <p className="mt-0.5 text-meta text-muted">Design system health</p>
      </div>

      <div className="flex flex-col gap-1">
        {NAV.map(({ id, label }) => {
          const current = state.screen === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={current ? 'page' : undefined}
              onClick={() => actions.navigate(id)}
              className={cn(
                'flex min-h-11 w-full items-center justify-between gap-2 rounded px-3 text-left hover:bg-raised hover:text-fg',
                current ? 'bg-raised font-semibold text-fg' : 'font-medium text-muted',
              )}
            >
              <span>{label}</span>
              {id === 'drift' && <span className="text-meta text-muted">{metrics.openDrift.length}</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-auto border-t border-line pt-4">
        <p className="font-medium">Sample workspace</p>
        <p className="mt-0.5 text-meta text-muted">All figures are sample data for the prototype.</p>
      </div>
    </nav>
  );
}
