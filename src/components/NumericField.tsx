import { useEffect, useState } from "react";

const inputFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
});

interface NumericFieldProps {
  id: string;
  label: string;
  value: number;
  unit: string;
  onChange: (value: number) => void;
  hint?: string;
  ariaLabel?: string;
}

export function sanitizeNumber(value: string): string {
  const normalized = value.trim().replace(/\u2212/g, "-");
  const sign = normalized.includes("-") ? "-" : "";
  const sanitized = normalized.replace(/[^\d.]/g, "");
  const [whole = "", ...fractions] = sanitized.split(".");
  if (fractions.length === 0) return `${sign}${whole}`;
  return `${sign}${whole}.${fractions.join("").slice(0, 2)}`;
}

export function parseNumericDraft(value: string): number | null {
  const sanitized = sanitizeNumber(value);
  if (["", ".", "-", "-."].includes(sanitized)) return null;
  return Number(sanitized);
}

export function NumericField({
  id,
  label,
  value,
  unit,
  onChange,
  hint,
  ariaLabel,
}: NumericFieldProps) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(inputFormatter.format(value));

  useEffect(() => {
    if (!focused) setText(inputFormatter.format(value));
  }, [focused, value]);

  return (
    <div className="field-group">
      <label htmlFor={id}>
        {label}
        {hint ? <span className="field-hint">{hint}</span> : null}
      </label>
      <div className="numeric-control">
        <input
          id={id}
          aria-label={ariaLabel}
          value={text}
          inputMode="decimal"
          autoComplete="off"
          onFocus={(event) => {
            setFocused(true);
            if (value === 0) {
              setText("");
            } else {
              event.currentTarget.select();
            }
          }}
          onBlur={(event) => {
            const nextValue = parseNumericDraft(event.currentTarget.value) ?? 0;
            onChange(nextValue);
            setFocused(false);
            setText(inputFormatter.format(nextValue));
          }}
          onChange={(event) => {
            const next = sanitizeNumber(event.target.value);
            setText(next);
            const nextValue = parseNumericDraft(next);
            if (nextValue !== null) onChange(nextValue);
          }}
        />
        <span className="field-unit" aria-hidden="true">
          {unit}
        </span>
      </div>
    </div>
  );
}
