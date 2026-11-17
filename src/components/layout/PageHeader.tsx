import { LAST_SCAN_LABEL } from '../../data/workspace';
import { cn } from '../../lib/cn';
import { usePulse } from '../../state/PulseContext';
import type { Screen } from '../../types';
import { Button } from '../ui/Button';

const TITLES: Record<Screen, [string, string]> = {
  overview: ['Overview', 'Three answers about your design system, from three connected sources.'],
  adoption: ['Adoption', 'Where the system is used, and whether custom UI is ignored or missing from the library.'],
  drift: ['Drift', 'Where Figma, Storybook and code differ, ranked by how far each difference reaches.'],
  components: ['Components', 'Every component with its usage, mapping, owner and open drift.'],
  impact: ['Impact', 'Hours saved as a range with assumptions you can edit, and a summary for leadership.'],
  settings: ['Settings', 'Sources, team mapping, roles and the audit log.'],
};

export function PageHeader({ className }: { className?: string }) {
  const { state, actions } = usePulse();
  const [title, subtitle] = TITLES[state.screen];

  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-4 pb-5 pt-5 bg-canvas z-10', className)}>
      <div>
        <h1 className="text-[40px] leading-[1.1] tracking-[-0.04em]">{title}</h1>
        <p className="mt-1.5 max-w-160 text-muted">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-meta text-muted">{LAST_SCAN_LABEL}</span>
        <Button onClick={actions.requestScan}>Scan now</Button>
      </div>
    </header>
  );
}
