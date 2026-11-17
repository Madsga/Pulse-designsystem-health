import {
  ADOPTION_HISTORY,
  BLAST_LEVELS,
  COMPONENTS,
  CUSTOM_UI,
  DRIFT_ITEMS,
  MAPPED_COMPONENTS,
  OPEN_DRIFT_HISTORY,
  TEAMS,
  TOTAL_COMPONENTS,
  WEEKLY_REUSE,
} from '../data/workspace';
import type { PulseState } from '../state/PulseContext';
import type { Assumptions, BlastLevel, CustomUiClass, DriftItem, LibraryComponent, Team, TeamId } from '../types';

export const isOpenDrift = (d: DriftItem) => d.status !== 'Accepted difference' && d.status !== 'Resolved';

/** Highest blast radius first, then most used. */
export const rankDrift = (items: DriftItem[]) =>
  [...items].sort((a, b) => b.blast - a.blast || b.usage - a.usage);

export interface ComponentRow extends LibraryComponent {
  status: string;
  openDrift?: DriftItem;
  driftLabel: string;
  mappedLabel: string;
}

export interface HealthInput {
  name: string;
  weight: string;
  value: number;
}

export interface HoursRange {
  low: number;
  high: number;
}

/** Saved hours = reused instances × (hours to build − hours to use), as a low–high range. */
export function hoursSaved(reused: number, a: Assumptions): HoursRange {
  const low = Math.max(0, reused * (a.buildLow - a.useHigh));
  const high = Math.max(low, reused * (a.buildHigh - a.useLow));
  return { low, high };
}

export function classificationOf(id: string, overrides: Record<string, CustomUiClass>) {
  const item = CUSTOM_UI.find((r) => r.id === id)!;
  return overrides[id] ?? item.classification;
}

export function computeMetrics(s: PulseState) {
  // Adoption, with the lead's ignored/missing overrides applied
  const delta = Object.fromEntries(TEAMS.map((t) => [t.id, 0])) as Record<TeamId, number>;
  for (const r of CUSTOM_UI) {
    const current = classificationOf(r.id, s.customUiOverrides);
    if (current !== r.classification) delta[r.teamId] += r.classification === 'ignored' ? -1 : 1;
  }
  const teams: Team[] = TEAMS.map((t) => ({
    ...t,
    ignored: t.ignored + delta[t.id],
    missing: t.missing - delta[t.id],
  }));
  const library = teams.reduce((n, t) => n + t.library, 0);
  const ignored = teams.reduce((n, t) => n + t.ignored, 0);
  const missing = teams.reduce((n, t) => n + t.missing, 0);
  const allUi = library + ignored + missing;
  const adoption = library / allUi;
  const coverage = (library + ignored) / allUi;
  const maxTeamLibrary = Math.max(...teams.map((t) => t.library));

  // Drift, with status and blast-radius overrides applied
  const driftItems: DriftItem[] = DRIFT_ITEMS.map((d) => ({
    ...d,
    status: s.statusOverrides[d.id] ?? d.status,
    blast: s.blastOverrides[d.id] ?? d.blast,
  }));
  const openDrift = driftItems.filter(isOpenDrift);
  const rankedOpen = rankDrift(openDrift);

  const blastSummary =
    openDrift.length === 0
      ? 'No open drift.'
      : ([3, 2, 1, 0] as BlastLevel[])
          .map((lv) => {
            const n = openDrift.filter((d) => d.blast === lv).length;
            return n > 0 ? `${n} ${BLAST_LEVELS[lv].label.toLowerCase()}` : '';
          })
          .filter(Boolean)
          .join(', ') + '.';

  // Health score
  const driftShare = openDrift.length / TOTAL_COMPONENTS;
  const mappedShare = MAPPED_COMPONENTS / TOTAL_COMPONENTS;
  const healthScore = Math.round(
    100 * (0.4 * adoption + 0.3 * (1 - driftShare) + 0.2 * coverage + 0.1 * mappedShare),
  );
  const healthInputs: HealthInput[] = [
    { name: 'Adoption', weight: '40%', value: adoption },
    { name: 'Components without open drift', weight: '30%', value: 1 - driftShare },
    { name: 'Coverage', weight: '20%', value: coverage },
    { name: 'Mapped across all three sources', weight: '10%', value: mappedShare },
  ];

  // Hours saved
  const a = s.assumptions;
  const reused8w = WEEKLY_REUSE.reduce((n, r) => n + r, 0);
  const reusedForPeriod = s.period === '8w' ? reused8w : Math.round((reused8w * 13) / 8);
  const hours8w = hoursSaved(reused8w, a);
  const hoursForPeriod = hoursSaved(reusedForPeriod, a);
  const avgBuild = (a.buildLow + a.buildHigh) / 2;
  const avgUse = (a.useLow + a.useHigh) / 2;
  const weeklyHours = WEEKLY_REUSE.map((r) => Math.max(0, r * (avgBuild - avgUse)));

  // Trends
  const adoptionTrend = [...ADOPTION_HISTORY, adoption * 100];
  const driftTrend = [...OPEN_DRIFT_HISTORY, openDrift.length];
  const adoptionDelta = adoption * 100 - adoptionTrend[0];
  const adoptionTrendText = `${adoptionDelta >= 0 ? 'Up' : 'Down'} ${Math.abs(adoptionDelta).toFixed(1)} points over 8 weeks.`;

  // Components
  const openByComponent = new Map(openDrift.map((d) => [d.component, d]));
  const components: ComponentRow[] = COMPONENTS.map((c) => {
    const openItem = openByComponent.get(c.name);
    return {
      ...c,
      status: c.status ?? 'Stable',
      openDrift: openItem,
      driftLabel: openItem ? `Open: ${BLAST_LEVELS[openItem.blast].label}` : 'None',
      mappedLabel: c.missingFrom.length ? `Missing: ${c.missingFrom.join(', ')}` : 'Figma, Storybook, code',
    };
  });

  /** Split a usage count across teams by each team's share of library instances. */
  const usageByTeam = (uses: number) =>
    teams.map((t) => ({
      name: t.name,
      count: Math.round((uses * t.library) / library),
      share: t.library / maxTeamLibrary,
    }));

  return {
    teams,
    totals: { library, ignored, missing },
    adoption,
    coverage,
    adoptionTrend,
    adoptionTrendText,
    driftItems,
    openDrift,
    rankedOpen,
    blastSummary,
    driftTrend,
    healthScore,
    healthInputs,
    reusedForPeriod,
    hours8w,
    hoursForPeriod,
    weeklyHours,
    components,
    usageByTeam,
  };
}

export type Metrics = ReturnType<typeof computeMetrics>;
