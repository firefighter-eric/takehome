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
}

function sanitizeNumber(value: string): string {
  const sanitized = value.replace(/[^\d.]/g, "");
  const [whole = "", ...fractions] = sanitized.split(".");
  if (fractions.length === 0) return whole;
  return `${whole}.${fractions.join("").slice(0, 2)}`;
}

export function NumericField({ id, label, value, unit, onChange, hint }: NumericFieldProps) {
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
          value={text}
          inputMode="decimal"
          autoComplete="off"
          onFocus={(event) => {
            setFocused(true);
            event.currentTarget.select();
          }}
          onBlur={() => {
            setFocused(false);
            setText(inputFormatter.format(value));
          }}
          onChange={(event) => {
            const next = sanitizeNumber(event.target.value);
            setText(next);
            onChange(next === "" || next === "." ? 0 : Number(next));
          }}
        />
        <span className="field-unit" aria-hidden="true">
          {unit}
        </span>
      </div>
    </div>
  );
}
