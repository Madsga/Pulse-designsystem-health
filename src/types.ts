export type Screen = 'overview' | 'adoption' | 'drift' | 'components' | 'impact' | 'settings';

export type DriftStatus = 'New' | 'Triaged' | 'Accepted difference' | 'Fix requested' | 'Resolved';

/** 0 = silently safe … 3 = must deprecate */
export type BlastLevel = 0 | 1 | 2 | 3;

export type CustomUiClass = 'ignored' | 'missing';

export type DriftView = 'open' | 'closed' | 'all';
export type ComponentFilter = 'all' | 'drift';
export type ComponentMode = 'map' | 'list';
export type Period = '8w' | '13w';

export type TeamId = 'checkout' | 'account' | 'admin' | 'search' | 'mobile';

export interface Team {
  id: TeamId;
  name: string;
  /** Library component instances */
  library: number;
  /** Custom UI where a library match exists */
  ignored: number;
  /** Custom UI with no library match */
  missing: number;
  repo: string;
  figmaProject: string;
}

export interface CustomUiItem {
  id: string;
  name: string;
  teamId: TeamId;
  classification: CustomUiClass;
  match: string;
}

export interface DriftItem {
  id: string;
  component: string;
  summary: string;
  figma: string;
  storybook: string;
  code: string;
  blast: BlastLevel;
  usage: number;
  where: string;
  status: DriftStatus;
}

export interface LibraryComponent {
  name: string;
  uses: number;
  owner: string;
  missingFrom: string[];
  status?: string;
}

export interface Assumptions {
  buildLow: number;
  buildHigh: number;
  useLow: number;
  useHigh: number;
}

export interface AuditEntry {
  when: string;
  who: string;
  what: string;
}
