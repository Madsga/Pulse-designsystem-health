// Sample workspace data. Every figure here is illustrative.
import type {
  Assumptions,
  AuditEntry,
  BlastLevel,
  CustomUiItem,
  DriftItem,
  DriftStatus,
  LibraryComponent,
  Team,
} from '../types';

export const TEAMS: Team[] = [
  { id: 'checkout', name: 'Checkout', library: 1240, ignored: 120, missing: 40, repo: 'apps/checkout', figmaProject: 'Checkout app' },
  { id: 'account', name: 'Account', library: 980, ignored: 150, missing: 70, repo: 'apps/account', figmaProject: 'Account app' },
  { id: 'admin', name: 'Admin console', library: 760, ignored: 250, missing: 190, repo: 'apps/admin', figmaProject: 'Admin console' },
  { id: 'search', name: 'Search', library: 520, ignored: 200, missing: 130, repo: 'apps/search', figmaProject: 'Search and browse' },
  { id: 'mobile', name: 'Mobile web', library: 410, ignored: 160, missing: 180, repo: 'apps/mobile-web', figmaProject: 'Mobile web' },
];

export const CUSTOM_UI: CustomUiItem[] = [
  { id: 'r1', name: 'Bulk action menu', teamId: 'admin', classification: 'ignored', match: 'Closest match: Dropdown menu' },
  { id: 'r2', name: 'Status pill', teamId: 'search', classification: 'ignored', match: 'Closest match: Badge' },
  { id: 'r3', name: 'Filter chips', teamId: 'search', classification: 'missing', match: 'No matching library component' },
  { id: 'r4', name: 'Stepper', teamId: 'checkout', classification: 'missing', match: 'No matching library component' },
  { id: 'r5', name: 'Inline date range', teamId: 'mobile', classification: 'ignored', match: 'Closest match: Date picker' },
  { id: 'r6', name: 'Avatar stack', teamId: 'account', classification: 'missing', match: 'No matching library component' },
];

export const DRIFT_ITEMS: DriftItem[] = [
  { id: 'd1', component: 'Button', summary: 'A danger-outline variant exists in code only', figma: 'Variant missing', storybook: 'Story present', code: 'Variant present', blast: 2, usage: 212, where: 'Checkout, Account and Admin console', status: 'New' },
  { id: 'd2', component: 'Date picker', summary: 'Range mode was added in code, not in Figma', figma: 'No range mode', storybook: 'Story added', code: 'Range mode prop', blast: 2, usage: 38, where: 'Mobile web and Search', status: 'New' },
  { id: 'd3', component: 'Modal', summary: 'Figma has a full-screen size that code lacks', figma: 'Full-screen size', storybook: 'Not present', code: 'Not implemented', blast: 0, usage: 61, where: 'Admin console and Account', status: 'Triaged' },
  { id: 'd4', component: 'Select', summary: 'A deprecated version is still in use', figma: 'Old version hidden', storybook: 'Marked deprecated', code: 'Still imported', blast: 1, usage: 9, where: 'Admin console', status: 'New' },
  { id: 'd5', component: 'Tooltip', summary: 'The current version has no Storybook story', figma: 'Current', storybook: 'Story missing', code: 'Current', blast: 0, usage: 147, where: 'all five products', status: 'New' },
  { id: 'd6', component: 'Table', summary: 'A sticky header exists in code only', figma: 'Not drawn', storybook: 'Story present', code: 'Sticky header prop', blast: 2, usage: 54, where: 'Admin console and Search', status: 'Triaged' },
  { id: 'd7', component: 'Toast', summary: 'Two code implementations of one component', figma: 'One component', storybook: 'One story', code: 'Two implementations', blast: 3, usage: 23, where: 'Checkout and Mobile web', status: 'New' },
  { id: 'd8', component: 'Checkbox', summary: 'The focus style differs between Figma and code', figma: 'Outer ring focus', storybook: 'Inner outline focus', code: 'Inner outline focus', blast: 1, usage: 320, where: 'all five products', status: 'Fix requested' },
  { id: 'd9', component: 'Tabs', summary: 'A counter badge exists in code, not in Figma', figma: 'No counter', storybook: 'Story present', code: 'Counter badge', blast: 0, usage: 44, where: 'Search and Account', status: 'New' },
  { id: 'd10', component: 'Input', summary: 'Error-state spacing differs between Figma and code', figma: 'Message below field', storybook: 'Tighter spacing', code: 'Tighter spacing', blast: 1, usage: 410, where: 'all five products', status: 'New' },
  { id: 'd11', component: 'Badge', summary: 'A colour token was renamed in code only', figma: 'Old token name', storybook: 'New token name', code: 'New token name', blast: 0, usage: 198, where: 'Search and Mobile web', status: 'New' },
];

export const COMPONENTS: LibraryComponent[] = [
  { name: 'Button', uses: 212, owner: 'Design system', missingFrom: [] },
  { name: 'Input', uses: 410, owner: 'Design system', missingFrom: [] },
  { name: 'Checkbox', uses: 320, owner: 'Design system', missingFrom: [] },
  { name: 'Card', uses: 286, owner: 'Design system', missingFrom: [] },
  { name: 'Badge', uses: 198, owner: 'Design system', missingFrom: [] },
  { name: 'Tooltip', uses: 147, owner: 'Design system', missingFrom: ['Storybook'] },
  { name: 'Select', uses: 168, owner: 'Design system', missingFrom: [], status: 'Partly deprecated' },
  { name: 'Dropdown menu', uses: 132, owner: 'Design system', missingFrom: [] },
  { name: 'Avatar', uses: 95, owner: 'Design system', missingFrom: [] },
  { name: 'Modal', uses: 61, owner: 'Design system', missingFrom: [] },
  { name: 'Table', uses: 54, owner: 'Admin console', missingFrom: [] },
  { name: 'Tabs', uses: 44, owner: 'Design system', missingFrom: [] },
  { name: 'Date picker', uses: 38, owner: 'Mobile web', missingFrom: [] },
  { name: 'Toast', uses: 23, owner: 'Design system', missingFrom: [] },
];

/** Size of the whole library; the sample above lists only some of them. */
export const TOTAL_COMPONENTS = 84;
export const MAPPED_COMPONENTS = 76;

export interface BlastLevelInfo {
  label: string;
  help: string;
  /** Rendered in the danger colour */
  severe?: boolean;
}

export const BLAST_LEVELS: Record<BlastLevel, BlastLevelInfo> = {
  0: { label: 'Silently safe', help: 'Update Figma or code and consumers absorb the change.' },
  1: { label: 'Mechanically migratable', help: 'Can be fixed with a find-and-replace.' },
  2: { label: 'Per-instance decision', help: 'Each place it is used needs a person to decide.' },
  3: { label: 'Must deprecate', help: 'Mark the old one deprecated and migrate consumers over time.', severe: true },
};

export const BLAST_ORDER: BlastLevel[] = [0, 1, 2, 3];

export const DRIFT_STATUSES: DriftStatus[] = ['New', 'Triaged', 'Accepted difference', 'Fix requested', 'Resolved'];

/** Library instances reused per week over the last 8 weeks. */
export const WEEKLY_REUSE = [62, 70, 76, 80, 84, 88, 90, 90];

/** Weekly history for the overview sparklines; the current week is appended live. */
export const ADOPTION_HISTORY = [66.1, 67.0, 68.2, 69.5, 70.3, 71.0, 71.7];
export const OPEN_DRIFT_HISTORY = [16, 17, 15, 14, 14, 13, 12];

export const DEFAULT_ASSUMPTIONS: Assumptions = { buildLow: 1.5, buildHigh: 3, useLow: 0.25, useHigh: 0.5 };

export const SOURCES = [
  { name: 'GitHub organisation', scope: 'Reads selected repositories. Can create issues after approval.' },
  { name: 'Storybook', scope: 'Reads the published story index.' },
  { name: 'Figma library', scope: 'Reads library components and variables.' },
];

export const ROLES = [
  { name: 'Admin', can: 'Connects sources, manages roles and team mapping.' },
  { name: 'Lead', can: 'Changes finding status and overrides, creates issues, exports summaries.' },
  { name: 'Contributor', can: 'Views all areas. Exact permissions to confirm.' },
  { name: 'Viewer', can: 'Read-only access to all areas.' },
];

export const INITIAL_AUDIT: AuditEntry[] = [
  { when: 'Today, 06:00', who: 'System', what: 'Daily scan completed' },
  { when: 'Monday, 14:12', who: 'Admin', what: 'Team mapping updated' },
  { when: 'Monday, 09:40', who: 'Admin', what: 'Storybook connected' },
];

export const LAST_SCAN_LABEL = 'Last scan: today, 06:00';
