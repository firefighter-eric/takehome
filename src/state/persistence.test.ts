// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { createDefaultJobScenario } from "../domain/jobScenario";
import { DEFAULT_PENSION_INPUT } from "../domain/personalPension";
import {
  loadTakeHomeState,
  parsePersistedState,
  saveTakeHomeState,
  STORAGE_KEY,
  type PersistedTakeHomeState,
} from "./persistence";

const sampleState: PersistedTakeHomeState = {
  draft: {
    monthlyGross: 42_000,
    monthlySocialInsurance: 3_500,
    monthlyHousingFund: 2_100,
    monthlySpecialDeduction: 1_000,
    months: 12,
    yearEndBonusMonths: 2,
    extraIncentive: 10_000,
    bonusTaxMode: "combined",
  },
  policyId: "beijing",
  contributionWage: 40_000,
  housingFundRate: 0.1,
  employerHousingFundRate: 0.12,
  housingFundRatesSynced: false,
  pensionInput: { ...DEFAULT_PENSION_INPUT, currentAge: 35, retirementAge: 65 },
  pensionIncome: null,
  scenarioA: createDefaultJobScenario("工作 A"),
  scenarioB: createDefaultJobScenario("工作 B"),
};

function createStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  } as unknown as Storage;
}

describe("take-home local persistence", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorage(),
    });
  });

  it("round-trips the current input state", () => {
    saveTakeHomeState(sampleState);
    const restored = loadTakeHomeState();
    expect(restored?.draft.monthlyGross).toBe(42_000);
    expect(restored?.policyId).toBe("beijing");
    expect(restored?.housingFundRatesSynced).toBe(false);
    expect(restored?.pensionInput.retirementAge).toBe(65);
  });

  it("rejects unsupported versions and malformed data", () => {
    expect(parsePersistedState("not json")).toBeNull();
    expect(parsePersistedState(JSON.stringify({ version: 0 }))).toBeNull();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 0 }));
    expect(loadTakeHomeState()).toBeNull();
  });

  it("falls back to safe known policies when stored values are invalid", () => {
    const raw = JSON.stringify({
      version: 1,
      policyId: "unknown-city",
      scenarioA: { ...createDefaultJobScenario("A"), policyId: "unknown-city" },
      scenarioB: createDefaultJobScenario("B"),
    });
    const parsed = parsePersistedState(raw);
    expect(parsed?.policyId).toBe("shanghai");
    expect(parsed?.scenarioA.policyId).toBe("shanghai");
  });
});
