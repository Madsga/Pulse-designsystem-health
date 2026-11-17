# Pulse

Design system health dashboard (prototype, sample data).

React 18 + TypeScript + Tailwind CSS v4, built with Vite.

```sh
npm install
npm run dev        # local dev server
npm run build      # type-check and build to dist/
```

## Structure

- `src/data/workspace.ts` — sample workspace data (teams, drift items, components, …)
- `src/lib/metrics.ts` — everything derived from data + user overrides (adoption, health score, hours saved)
- `src/state/PulseContext.tsx` — app state and actions, exposed through `usePulse()`
- `src/components/ui/` — reusable Pulse UI (Button, Card, Toggle, Meter, Sparkline, Table, BlastTag, …)
- `src/components/samples/` — light-themed illustrative components shown in drift and component previews
- `src/components/layout/` — sidebar and page header
- `src/views/` — one file per screen

`legacy/prototype.html` is the original single-file export this was rebuilt from.
