import type { ReactNode } from 'react';
import {
  Col,
  DiffNote,
  FieldError,
  Label,
  Row,
  SBadge,
  SButton,
  SCheckbox,
  SFrame,
  SInput,
  SSelect,
  STable,
  STabs,
  SToast,
  STooltip,
  Stage,
} from './primitives';

interface Side {
  label: string;
  render: () => ReactNode;
}

const ModalSizes = ({ fullBuilt }: { fullBuilt: boolean }) => (
  <Row className="items-end">
    <SFrame width={56} height={48}>S</SFrame>
    <SFrame width={84} height={64}>M</SFrame>
    {fullBuilt ? (
      <SFrame width={132} height={88}>Full</SFrame>
    ) : (
      <SFrame width={132} height={88} diff>Not built</SFrame>
    )}
  </Row>
);

/** What a drift item looks like in Figma and in code, keyed by drift item id. */
const DRIFT_SAMPLES: Record<string, { figma: Side; code: Side }> = {
  d1: {
    figma: {
      label: 'Figma: primary, secondary and ghost buttons',
      render: () => (
        <>
          <SButton kind="primary">Primary</SButton>
          <SButton>Secondary</SButton>
          <SButton kind="ghost">Ghost</SButton>
        </>
      ),
    },
    code: {
      label: 'Code: the same plus a danger outline button',
      render: () => (
        <>
          <SButton kind="primary">Primary</SButton>
          <SButton>Secondary</SButton>
          <SButton kind="ghost">Ghost</SButton>
          <SButton kind="danger" diff>Danger outline</SButton>
          <DiffNote>Code only</DiffNote>
        </>
      ),
    },
  },
  d2: {
    figma: { label: 'Figma: single date field', render: () => <SInput>12 Nov 2026</SInput> },
    code: {
      label: 'Code: a range date field',
      render: () => (
        <Col>
          <SInput diff className="min-w-47.5">12 Nov to 18 Nov 2026</SInput>
          <DiffNote>Range mode, code only</DiffNote>
        </Col>
      ),
    },
  },
  d3: {
    figma: { label: 'Figma: small, medium and full-screen modal frames', render: () => <ModalSizes fullBuilt /> },
    code: { label: 'Code: small and medium only, full-screen not built', render: () => <ModalSizes fullBuilt={false} /> },
  },
  d4: {
    figma: { label: 'Figma: one select', render: () => <SSelect /> },
    code: {
      label: 'Code: the current select and the deprecated one',
      render: () => (
        <Col>
          <SSelect />
          <SSelect diff trailing={<SBadge tone="warn">Deprecated</SBadge>} />
        </Col>
      ),
    },
  },
  d5: {
    figma: { label: 'Figma: tooltip above a button', render: () => <STooltip /> },
    code: {
      label: 'Code: the same tooltip, but no Storybook story',
      render: () => (
        <>
          <STooltip />
          <DiffNote>No story</DiffNote>
        </>
      ),
    },
  },
  d6: {
    figma: { label: 'Figma: table with a plain header', render: () => <STable /> },
    code: {
      label: 'Code: table with a sticky header',
      render: () => (
        <Col>
          <STable stickyHeaderDiff />
          <DiffNote>Sticky header, code only</DiffNote>
        </Col>
      ),
    },
  },
  d7: {
    figma: { label: 'Figma: one toast component', render: () => <SToast /> },
    code: {
      label: 'Code: two toast implementations',
      render: () => (
        <Col>
          <SToast />
          <SToast variant="plain" diff />
          <DiffNote>Two implementations</DiffNote>
        </Col>
      ),
    },
  },
  d8: {
    figma: {
      label: 'Figma: checkbox with an outer focus ring',
      render: () => (
        <Row>
          <SCheckbox style={{ boxShadow: '0 0 0 3px #93c5fd' }} />
          Focused
        </Row>
      ),
    },
    code: {
      label: 'Code: checkbox with an inner focus outline',
      render: () => (
        <Row>
          <SCheckbox diff style={{ boxShadow: 'inset 0 0 0 2px #2563eb' }} />
          Focused
        </Row>
      ),
    },
  },
  d9: {
    figma: { label: 'Figma: tabs without a counter', render: () => <STabs /> },
    code: {
      label: 'Code: tabs with a counter badge',
      render: () => (
        <>
          <STabs
            counter={
              <SBadge tone="neutral" diff>
                12
              </SBadge>
            }
          />
          <DiffNote>Counter badge, code only</DiffNote>
        </>
      ),
    },
  },
  d10: {
    figma: {
      label: 'Figma: input with the error message spaced 8 pixels below',
      render: () => (
        <Col>
          <SInput error>name@company</SInput>
          <FieldError style={{ marginTop: 6 }}>Enter a full address</FieldError>
        </Col>
      ),
    },
    code: {
      label: 'Code: input with the error message tighter, 2 pixels below',
      render: () => (
        <Col style={{ gap: 0 }}>
          <SInput error>name@company</SInput>
          <FieldError diff style={{ marginTop: 2 }}>
            Enter a full address
          </FieldError>
        </Col>
      ),
    },
  },
  d11: {
    figma: {
      label: 'Figma: badge using the old token name',
      render: () => (
        <Col>
          <SBadge tone="info">Info</SBadge>
          <Label className="font-mono">color/badge-info</Label>
        </Col>
      ),
    },
    code: {
      label: 'Code: badge using the renamed token',
      render: () => (
        <Col>
          <SBadge tone="info">Info</SBadge>
          <Label diff className="font-mono">
            color/status-info
          </Label>
        </Col>
      ),
    },
  },
};

export function DriftSample({ driftId }: { driftId: string }) {
  const sample = DRIFT_SAMPLES[driftId];
  if (!sample) return null;
  return (
    <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] gap-2">
      {(['figma', 'code'] as const).map((side) => (
        <div key={side}>
          <p className="mb-1 text-micro opacity-70">{side === 'figma' ? 'Figma' : 'Code'}</p>
          <Stage label={sample[side].label}>{sample[side].render()}</Stage>
        </div>
      ))}
    </div>
  );
}
