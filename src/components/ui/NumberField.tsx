import { useEffect, useId, useState } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}

/**
 * A labelled number input. Keeps the raw text while typing (so the field can be
 * cleared or hold "1."), and reports a parsed, non-negative number.
 */
export function NumberField({ label, value, onChange, min = 0, step = 0.25 }: NumberFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));

  // Follow outside changes, such as "Reset to defaults". The draft is read but
  // deliberately not a dependency, so typing never resets the field.
  useEffect(() => {
    if (parse(draft, min) !== value) setDraft(String(value));
  }, [value]);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-medium">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange(parse(e.target.value, min));
        }}
        className="min-h-11 w-full rounded border border-control bg-deep px-3.5 text-fg"
      />
    </div>
  );
}

function parse(text: string, min: number) {
  const v = parseFloat(text);
  return Number.isNaN(v) || v < min ? min : v;
}
