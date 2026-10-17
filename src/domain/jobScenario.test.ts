import { describe, expect, it } from "vitest";
import {
  calculateJobScenario,
  createDefaultJobScenario,
} from "./jobScenario";

describe("job scenario calculation", () => {
  it("uses the existing Shanghai defaults and salary calculator", () => {
    const calculated = calculateJobScenario(createDefaultJobScenario("工作 A"));

    expect(calculated.error).toBeNull();
    expect(calculated.policy.id).toBe("shanghai");
    expect(calculated.housingFundEstimate.rate).toBe(0.12);
    expect(calculated.employerHousingFundEstimate.rate).toBe(0.12);
    expect(calculated.result?.totalNet).toBe(807_866.86);
    expect(calculated.totalCompanyCost).toBe(1_293_751.32);
  });

  it("keeps each work scenario independent", () => {
    const scenarioA = createDefaultJobScenario("工作 A");
    const scenarioB = {
      ...createDefaultJobScenario("工作 B"),
      salary: {
        ...createDefaultJobScenario("工作 B").salary,
        monthlyGross: 90_000,
      },
    };

    const resultA = calculateJobScenario(scenarioA);
    const resultB = calculateJobScenario(scenarioB);

    expect(resultB.result!.totalGross).toBeGreaterThan(resultA.result!.totalGross);
    expect(resultB.result!.totalNet).toBeGreaterThan(resultA.result!.totalNet);
    expect(scenarioA.salary.monthlyGross).toBe(75_000);
  });
});
