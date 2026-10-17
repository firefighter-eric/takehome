import { useState, type ComponentPropsWithoutRef } from "react";

type NumberInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value: number;
  onValueChange: (value: number) => void;
};

export function NumberInput({
  value,
  onValueChange,
  onFocus,
  onBlur,
  ...props
}: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <input
      {...props}
      type="number"
      value={draft ?? String(value)}
      onFocus={(event) => {
        setDraft(event.currentTarget.value);
        onFocus?.(event);
      }}
      onChange={(event) => {
        setDraft(event.currentTarget.value);
        const next = event.currentTarget.valueAsNumber;
        if (Number.isFinite(next)) onValueChange(next);
      }}
      onBlur={(event) => {
        const next = event.currentTarget.valueAsNumber;
        onValueChange(Number.isFinite(next) ? next : 0);
        setDraft(null);
        onBlur?.(event);
      }}
    />
  );
}
