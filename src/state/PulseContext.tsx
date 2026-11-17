import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { BLAST_LEVELS, CUSTOM_UI, DEFAULT_ASSUMPTIONS, DRIFT_ITEMS, INITIAL_AUDIT, TEAMS } from '../data/workspace';
import { classificationOf, computeMetrics, type Metrics } from '../lib/metrics';
import type {
  Assumptions,
  AuditEntry,
  BlastLevel,
  ComponentFilter,
  ComponentMode,
  CustomUiClass,
  DriftStatus,
  DriftView,
  Period,
  Screen,
} from '../types';

export interface PulseState {
  screen: Screen;
  selectedDrift: string | null;
  driftView: DriftView;
  selectedComponent: string | null;
  componentFilter: ComponentFilter;
  componentMode: ComponentMode;
  statusOverrides: Record<string, DriftStatus>;
  blastOverrides: Record<string, BlastLevel>;
  customUiOverrides: Record<string, CustomUiClass>;
  period: Period;
  assumptions: Assumptions;
  toast: string;
  audit: AuditEntry[];
}

const initialState: PulseState = {
  screen: 'overview',
  selectedDrift: null,
  driftView: 'open',
  selectedComponent: null,
  componentFilter: 'all',
  componentMode: 'map',
  statusOverrides: {},
  blastOverrides: {},
  customUiOverrides: {},
  period: '8w',
  assumptions: DEFAULT_ASSUMPTIONS,
  toast: '',
  audit: INITIAL_AUDIT,
};

type Patch = Partial<PulseState> | ((s: PulseState) => Partial<PulseState>);

const driftName = (id: string) => DRIFT_ITEMS.find((d) => d.id === id)?.component ?? id;
const teamName = (id: string) => TEAMS.find((t) => t.id === id)?.name ?? id;

function usePulseStore() {
  const [state, setState] = useState(initialState);

  /** Update state without touching the toast. */
  const set = useCallback((patch: Patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  /** A user action: update state, optionally log it to the audit trail, and replace the toast. */
  const act = useCallback((patch: Patch, auditText: string | ((s: PulseState) => string) = '', toast = '') => {
    setState((s) => {
      const what = typeof auditText === 'function' ? auditText(s) : auditText;
      return {
        ...s,
        ...(typeof patch === 'function' ? patch(s) : patch),
        audit: what ? [{ when: 'Just now', who: 'Lead (you)', what }, ...s.audit] : s.audit,
        toast,
      };
    });
  }, []);

  const actions = useMemo(
    () => ({
      navigate: (screen: Screen) => set({ screen, toast: '' }),
      notify: (message: string) => act({}, '', message),
      dismissToast: () => set({ toast: '' }),
      requestScan: () =>
        act({}, 'Manual scan requested', 'Scan queued. Results usually arrive within a few minutes.'),

      // Drift
      openDriftItem: (id: string) => set({ screen: 'drift', selectedDrift: id, toast: '' }),
      selectDrift: (id: string) => set({ selectedDrift: id }),
      setDriftView: (driftView: DriftView) => set({ driftView }),
      setDriftStatus: (id: string, status: DriftStatus) =>
        act(
          (s) => ({ statusOverrides: { ...s.statusOverrides, [id]: status } }),
          `Status of ${driftName(id)} drift changed to ${status}`,
        ),
      setBlast: (id: string, level: BlastLevel) =>
        act(
          (s) => ({ blastOverrides: { ...s.blastOverrides, [id]: level } }),
          `Blast radius of ${driftName(id)} changed to ${BLAST_LEVELS[level].label}`,
        ),
      createIssue: (id: string) =>
        act(
          (s) => ({ statusOverrides: { ...s.statusOverrides, [id]: 'Fix requested' } }),
          `GitHub issue created for ${driftName(id)} drift`,
          'Issue created in the design system repository. This is a prototype, so nothing was sent.',
        ),

      // Adoption
      flipCustomUi: (id: string) =>
        act((s) => {
          const next: CustomUiClass = classificationOf(id, s.customUiOverrides) === 'ignored' ? 'missing' : 'ignored';
          return { customUiOverrides: { ...s.customUiOverrides, [id]: next } };
        }, (s) => flipAuditText(id, s.customUiOverrides), 'Override saved. It will be kept across scans.'),

      // Components
      setComponentFilter: (componentFilter: ComponentFilter) => set({ componentFilter }),
      setComponentMode: (componentMode: ComponentMode) => set({ componentMode }),
      selectComponent: (name: string) => set({ selectedComponent: name }),
      openComponent: (name: string) =>
        set({ screen: 'components', selectedComponent: name, componentFilter: 'all', toast: '' }),
      toggleComponent: (name: string) =>
        set((s) => ({ selectedComponent: s.selectedComponent === name ? null : name })),

      // Impact
      setPeriod: (period: Period) => set({ period }),
      setAssumption: (key: keyof Assumptions, value: number) =>
        act((s) => ({ assumptions: { ...s.assumptions, [key]: value } })),
      resetAssumptions: () => act({ assumptions: DEFAULT_ASSUMPTIONS }, '', 'Assumptions reset to the defaults.'),
    }),
    [act, set],
  );

  const metrics = useMemo(() => computeMetrics(state), [state]);

  return { state, metrics, actions };
}

function flipAuditText(id: string, overrides: Record<string, CustomUiClass>) {
  const item = CUSTOM_UI.find((r) => r.id === id)!;
  const next = classificationOf(id, overrides) === 'ignored' ? 'missing' : 'ignored';
  return `Override applied: ${item.name} in ${teamName(item.teamId)} marked as ${next}`;
}

export type PulseActions = ReturnType<typeof usePulseStore>['actions'];

interface PulseContextValue {
  state: PulseState;
  metrics: Metrics;
  actions: PulseActions;
}

const PulseContext = createContext<PulseContextValue | null>(null);

export function PulseProvider({ children }: { children: ReactNode }) {
  const value = usePulseStore();
  return <PulseContext.Provider value={value}>{children}</PulseContext.Provider>;
}

export function usePulse() {
  const ctx = useContext(PulseContext);
  if (!ctx) throw new Error('usePulse must be used inside <PulseProvider>');
  return ctx;
}
