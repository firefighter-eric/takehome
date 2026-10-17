import { describe, expect, it } from "vitest";
import { parseNumericDraft, sanitizeNumber } from "./NumericField";

describe("NumericField draft parsing", () => {
  it("keeps an empty draft temporary instead of forcing it back to zero", () => {
    expect(parseNumericDraft("")).toBeNull();
    expect(parseNumericDraft(".")).toBeNull();
    expect(parseNumericDraft("-")).toBeNull();
    expect(parseNumericDraft("-.")).toBeNull();
  });

  it("parses a replacement value without requiring a leading zero", () => {
    expect(parseNumericDraft("2")).toBe(2);
    expect(parseNumericDraft("02")).toBe(2);
  });

  it("sanitizes separators and limits decimal precision", () => {
    expect(sanitizeNumber("12,345.678")).toBe("12345.67");
    expect(parseNumericDraft("2.555")).toBe(2.55);
    expect(parseNumericDraft("-2.555")).toBe(-2.55);
  });

  it("preserves negative amounts so validation can reject them instead of changing their sign", () => {
    expect(sanitizeNumber("-1,234.56")).toBe("-1234.56");
    expect(parseNumericDraft("-100")).toBe(-100);
    expect(parseNumericDraft(" −100 ")).toBe(-100);
    expect(parseNumericDraft("¥-1,234.56")).toBe(-1234.56);
  });
});
