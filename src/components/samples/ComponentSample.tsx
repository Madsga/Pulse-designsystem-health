import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import {
  Col,
  FieldError,
  Label,
  Row,
  SAvatar,
  SBadge,
  SButton,
  SCard,
  SCheckbox,
  SInput,
  SMenu,
  SSelect,
  STable,
  STabs,
  SToast,
  STooltip,
  Stage,
} from './primitives';

const CALENDAR_DAYS = Array.from({ length: 14 }, (_, i) => i + 8);

/** Each library component in its main variants and states. */
const SAMPLES: Record<string, { label: string; render: () => ReactNode }> = {
  Button: {
    label: 'Button: primary, secondary, ghost and small',
    render: () => (
      <>
        <SButton kind="primary">Primary</SButton>
        <SButton>Secondary</SButton>
        <SButton kind="ghost">Ghost</SButton>
        <SButton kind="primary" className="h-6 px-2.5 text-xs">
          Small
        </SButton>
      </>
    ),
  },
  Input: {
    label: 'Input: default and error',
    render: () => (
      <>
        <Col>
          <Label>Email</Label>
          <SInput>name@company.com</SInput>
        </Col>
        <Col>
          <Label>Email, error</Label>
          <SInput error>name@company</SInput>
          <FieldError>Enter a full address</FieldError>
        </Col>
      </>
    ),
  },
  Checkbox: {
    label: 'Checkbox: unchecked, checked, focused',
    render: () => (
      <>
        <Row>
          <SCheckbox />
          Unchecked
        </Row>
        <Row>
          <SCheckbox checked />
          Checked
        </Row>
        <Row>
          <SCheckbox style={{ boxShadow: '0 0 0 3px #93c5fd' }} />
          Focused
        </Row>
      </>
    ),
  },
  Card: {
    label: 'Card with title, detail and action',
    render: () => (
      <SCard>
        <div className="font-semibold">Order summary</div>
        <Label className="mt-0.5 block">3 items, delivery Friday</Label>
        <div className="mt-2.5">
          <SButton kind="primary" className="h-7">
            View order
          </SButton>
        </div>
      </SCard>
    ),
  },
  Badge: {
    label: 'Badge: info, success, warning, neutral',
    render: () => (
      <>
        <SBadge tone="info">Info</SBadge>
        <SBadge tone="ok">Success</SBadge>
        <SBadge tone="warn">Warning</SBadge>
        <SBadge tone="neutral">Neutral</SBadge>
      </>
    ),
  },
  Tooltip: { label: 'Tooltip above a button', render: () => <STooltip /> },
  Select: {
    label: 'Select with its options open',
    render: () => (
      <Col>
        <SSelect className="min-w-45" />
        <SMenu className="min-w-45" items={['Starter', 'Team', 'Enterprise']} />
      </Col>
    ),
  },
  'Dropdown menu': {
    label: 'Dropdown menu with actions',
    render: () => (
      <SMenu items={['Edit', 'Duplicate', 'Archive', { label: 'Delete', danger: true }]} />
    ),
  },
  Avatar: {
    label: 'Avatar stack with a count',
    render: () => (
      <Row className="gap-0">
        <SAvatar>AB</SAvatar>
        <SAvatar className="-ml-2.5 bg-[#fbcfe8] text-[#500724]">CD</SAvatar>
        <SAvatar className="-ml-2.5 bg-[#bbf7d0] text-[#052e16]">EF</SAvatar>
        <SAvatar className="-ml-2.5 bg-[#e7e7e2] text-[#3a3a36]">+4</SAvatar>
      </Row>
    ),
  },
  Modal: {
    label: 'Confirmation modal',
    render: () => (
      <div className="min-w-60 rounded border border-[#d0d0ca] bg-white p-3.5 shadow-[0_8px_24px_rgb(0_0_0/0.1)]">
        <div className="font-semibold">Delete project?</div>
        <Label className="mt-1 mb-3 block">This cannot be undone.</Label>
        <div className="flex justify-end gap-2">
          <SButton>Cancel</SButton>
          <SButton kind="destructive">Delete</SButton>
        </div>
      </div>
    ),
  },
  Table: { label: 'Table with a header and three rows', render: () => <STable /> },
  Tabs: { label: 'Tabs with one active', render: () => <STabs /> },
  'Date picker': {
    label: 'Date picker with a selected day',
    render: () => (
      <SCard className="min-w-0">
        <div className="mb-1.5 font-semibold">November 2026</div>
        <div className="grid grid-cols-[repeat(7,26px)] gap-0.5 text-center">
          {CALENDAR_DAYS.map((d) => (
            <span
              key={d}
              className={cn('inline-flex h-6.5 items-center justify-center rounded', d === 12 && 'bg-sample-blue text-white')}
            >
              {d}
            </span>
          ))}
        </div>
      </SCard>
    ),
  },
  Toast: { label: 'Success toast', render: () => <SToast /> },
};

export function ComponentSample({ name }: { name: string }) {
  const sample = SAMPLES[name];
  if (!sample) return null;
  return <Stage label={sample.label}>{sample.render()}</Stage>;
}
