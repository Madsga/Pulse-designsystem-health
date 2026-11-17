import { PageHeader } from './components/layout/PageHeader';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/ui/Toast';
import { usePulse } from './state/PulseContext';
import type { Screen } from './types';
import { AdoptionView } from './views/AdoptionView';
import { ComponentsView } from './views/ComponentsView';
import { DriftView } from './views/DriftView';
import { ImpactView } from './views/ImpactView';
import { OverviewView } from './views/OverviewView';
import { SettingsView } from './views/SettingsView';

const VIEWS: Record<Screen, () => JSX.Element> = {
  overview: OverviewView,
  adoption: AdoptionView,
  drift: DriftView,
  components: ComponentsView,
  impact: ImpactView,
  settings: SettingsView,
};

export function App() {
  const { state, actions } = usePulse();
  const View = VIEWS[state.screen];

  return (
    <div className="flex min-h-screen flex-wrap items-stretch">
      <Sidebar />
      <main className="min-w-0 flex-[999_1_560px] px-8 pt-7 pb-12">
        <div className="@container max-w-280">
          <PageHeader />
          {state.toast && <Toast message={state.toast} onDismiss={actions.dismissToast} />}
          <View />
        </div>
      </main>
    </div>
  );
}
