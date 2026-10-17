import { describe, expect, it } from "vitest";
import { calculateSalary, type SalaryInput } from "./salary";
import {
  calculatePersonalPension,
  calculatePersonalPensionFromAnnualIncome,
  annualPensionIncomeFromSalary,
  DEFAULT_PENSION_INPUT,
  EMPTY_ANNUAL_PENSION_INCOME,
  validateAnnualPensionIncome,
  validatePensionInput,
  type PersonalPensionInput,
} from "./personalPension";

const salary: SalaryInput = {
  monthlyGross: 50_000,
  monthlySocialInsurance: 0,
  monthlyHousingFund: 0,
  monthlySpecialDeduction: 0,
  months: 12,
  yearEndBonusMonths: 0,
  extraIncentive: 0,
  bonusTaxMode: "separate",
};
const estimate = (pension: Partial<PersonalPensionInput> = {}, pay: Partial<SalaryInput> = {}) =>
  calculatePersonalPension({ ...salary, ...pay }, { ...DEFAULT_PENSION_INPUT, ...pension });

describe("personal pension annual tax", () => {
  it("calculates tax savings, net cost and cash after contribution", () => {
    const result = estimate();
    expect(result.annualGross).toBe(600_000);
    expect(result.annualTaxBefore).toBe(109_080);
    expect(result.annualTaxAfter).toBe(105_480);
    expect(result.taxSaving).toBe(3_600);
    expect(result.netContribution).toBe(8_400);
    expect(result.taxOnlyWithdrawal).toBe(11_640);
    expect(result.disposableCashAfter).toBe(482_520);
  });

  it("computes across tax brackets instead of multiplying by the top rate", () => {
    const result = estimate({}, { monthlyGross: 17_500 });
    expect(result.taxableIncomeBefore).toBe(150_000);
    expect(result.taxSaving).toBe(1_800);
  });

  it("uses the full annual basic deduction and does not prorate the pension limit", () => {
    const result = estimate({}, { monthlyGross: 100_000, months: 3 });
    expect(result.taxableIncomeBefore).toBe(240_000);
    expect(result.taxSaving).toBe(2_400);
    const lowIncome = { ...salary, monthlyGross: 10_000, months: 3 };
    expect(calculateSalary(lowIncome).totalTax).toBe(450);
    expect(calculatePersonalPension(lowIncome, DEFAULT_PENSION_INPUT).annualTaxBefore).toBe(0);
  });

  it("limits savings to the tax actually due", () => {
    expect(estimate({}, { monthlyGross: 5_500 }).taxSaving).toBe(180);
    expect(estimate({}, { monthlyGross: 5_000 }).taxSaving).toBe(0);
  });

  it("keeps separately taxed bonuses outside the deduction", () => {
    const result = estimate({}, { monthlyGross: 5_000, yearEndBonusMonths: 12 });
    expect(result.annualGross).toBe(120_000);
    expect(result.taxableIncomeBefore).toBe(0);
    expect(result.annualTaxBefore).toBe(5_790);
    expect(result.annualTaxAfter).toBe(5_790);
    expect(result.taxSaving).toBe(0);
    expect(estimate({}, { monthlyGross: 5_000, yearEndBonusMonths: 12, bonusTaxMode: "combined" }).taxSaving).toBe(1_200);
  });

  it("includes extra incentives and the entered social, housing and special deductions", () => {
    const result = estimate({}, {
      monthlySocialInsurance: 2_000, monthlyHousingFund: 3_000,
      monthlySpecialDeduction: 1_000, extraIncentive: 50_000,
    });
    expect(result.taxableIncomeBefore).toBe(518_000);
  });

  it("does not change salary inputs or pension inputs", () => {
    const pay = Object.freeze({ ...salary });
    const input = Object.freeze({ ...DEFAULT_PENSION_INPUT });
    calculatePersonalPension(pay, input);
    expect(pay).toEqual(salary);
    expect(input).toEqual(DEFAULT_PENSION_INPUT);
  });
});

describe("direct annual pension income", () => {
  const annualIncome = { ...EMPTY_ANNUAL_PENSION_INCOME, annualGross: 600_000 };

  it("calculates tax savings from directly entered annual income", () => {
    const result = calculatePersonalPensionFromAnnualIncome(annualIncome, DEFAULT_PENSION_INPUT);
    expect(result.annualGross).toBe(600_000);
    expect(result.taxableIncomeBefore).toBe(540_000);
    expect(result.annualTaxBefore).toBe(109_080);
    expect(result.taxSaving).toBe(3_600);
  });

  it("uses annual deduction totals without multiplying by 12 again", () => {
    const result = calculatePersonalPensionFromAnnualIncome({
      ...annualIncome, annualSocialAndHousing: 60_000, annualSpecialDeduction: 12_000,
    }, DEFAULT_PENSION_INPUT);
    expect(result.taxableIncomeBefore).toBe(468_000);
    expect(result.annualTaxBefore).toBe(87_480);
    expect(result.taxSaving).toBe(3_600);
  });

  it("treats the bonus as part of total income and respects its tax mode", () => {
    const income = { ...annualIncome, annualGross: 200_000, annualBonus: 100_000 };
    const separate = calculatePersonalPensionFromAnnualIncome(income, DEFAULT_PENSION_INPUT);
    const combined = calculatePersonalPensionFromAnnualIncome({ ...income, bonusTaxMode: "combined" }, DEFAULT_PENSION_INPUT);
    expect(separate.annualGross).toBe(200_000);
    expect(separate.taxableIncomeBefore).toBe(40_000);
    expect(separate.taxSaving).toBe(640);
    expect(combined.annualGross).toBe(200_000);
    expect(combined.taxableIncomeBefore).toBe(140_000);
    expect(combined.taxSaving).toBe(1_200);
  });

  it("imports actual paid months, incentives and deductions into annual totals", () => {
    const imported = annualPensionIncomeFromSalary({
      ...salary, monthlyGross: 10_000, months: 3, yearEndBonusMonths: 2, extraIncentive: 5_000,
      monthlySocialInsurance: 200, monthlyHousingFund: 100, monthlySpecialDeduction: 1_000,
    });
    expect(imported).toEqual({
      annualGross: 55_000, annualBonus: 20_000, bonusTaxMode: "separate",
      annualSocialAndHousing: 900, annualSpecialDeduction: 3_000,
    });
  });

  it("accepts zero annual income and produces no tax savings", () => {
    const result = calculatePersonalPensionFromAnnualIncome(EMPTY_ANNUAL_PENSION_INCOME, DEFAULT_PENSION_INPUT);
    expect(result.annualTaxBefore).toBe(0);
    expect(result.taxSaving).toBe(0);
  });

  it.each([
    { annualGross: -1 }, { annualGross: Infinity }, { annualBonus: 600_001 },
    { annualBonus: -1 }, { annualSocialAndHousing: -1 }, { annualSpecialDeduction: NaN },
  ])("rejects invalid annual income %j", (change) => {
    const income = { ...annualIncome, ...change };
    expect(validateAnnualPensionIncome(income)).not.toBeNull();
    expect(() => calculatePersonalPensionFromAnnualIncome(income, DEFAULT_PENSION_INPUT)).toThrow(RangeError);
  });
});

describe("personal pension annualized cash flows", () => {
  it("matches the agreed next-year refund example", () => {
    const result = estimate();
    expect(result.cashFlows).toEqual([
      { year: 0, amount: -12_000 },
      { year: 1, amount: 3_600 },
      { year: 20, amount: 11_640 },
    ]);
    expect(result.taxOnlyAnnualizedReturn).toBeCloseTo(0.0161006284, 10);
  });

  it("matches the closed-form immediate tax relief calculation", () => {
    const result = estimate({ refundTiming: "immediate" });
    expect(result.taxOnlyAnnualizedReturn).toBeCloseTo((11_640 / 8_400) ** (1 / 20) - 1, 10);
    expect(result.taxOnlyAnnualizedReturn!).toBeGreaterThan(estimate().taxOnlyAnnualizedReturn!);
    expect(result.taxSaving).toBe(3_600);
  });

  it("combines refund and withdrawal when both arrive in one year", () => {
    expect(estimate({ currentAge: 59 }).taxOnlyAnnualizedReturn).toBeCloseTo(0.27, 10);
  });

  it("annualizes the same tax benefit over the actual holding period", () => {
    expect(estimate({ currentAge: 30 }).taxOnlyAnnualizedReturn).toBeCloseTo(0.010780, 6);
    expect(estimate({ currentAge: 50 }).taxOnlyAnnualizedReturn).toBeCloseTo(0.031804, 6);
  });

  it("returns negative tax-only yields when withdrawal tax exceeds tax relief", () => {
    const result = estimate({}, { monthlyGross: 5_000 });
    expect(result.taxOnlyAnnualizedReturn).toBeCloseTo(0.97 ** (1 / 20) - 1, 10);
    expect(estimate({}, { monthlyGross: 5_500 }).taxOnlyAnnualizedReturn!).toBeLessThan(0);
  });

  it("shows zero instead of negative zero when tax relief equals withdrawal tax", () => {
    expect(estimate({}, { monthlyGross: 6_000 }).taxOnlyAnnualizedReturn).toBe(0);
    expect(estimate({ refundTiming: "immediate" }, { monthlyGross: 6_000 }).taxOnlyAnnualizedReturn).toBe(0);
  });

  it("leaves annualized return undefined for zero contribution", () => {
    const result = estimate({ contribution: 0 });
    expect(result.taxSaving).toBe(0);
    expect(result.netContribution).toBe(0);
    expect(result.taxOnlyAnnualizedReturn).toBeNull();
    expect(result.combinedAnnualizedReturn).toBeNull();
    expect(result.annualizedUplift).toBeNull();
  });

  it("recalculates combined IRR and taxes investment earnings on withdrawal", () => {
    const result = estimate({ expectedAnnualReturn: 0.02, refundTiming: "immediate" });
    expect(result.investmentBalance).toBe(17_831.37);
    expect(result.withdrawalTax).toBe(534.94);
    expect(result.netWithdrawal).toBe(17_296.43);
    expect(result.combinedAnnualizedReturn).toBeCloseTo((17_296.43 / 8_400) ** (1 / 20) - 1, 10);
    expect(result.annualizedUplift).toBeCloseTo(result.combinedAnnualizedReturn! - 0.02, 10);
    expect(result.taxOnlyAnnualizedReturn).toBeCloseTo(estimate({ refundTiming: "immediate" }).taxOnlyAnnualizedReturn!, 10);
  });

  it("handles investment losses and long holding periods without NaN", () => {
    const result = estimate({ expectedAnnualReturn: -0.05, currentAge: 18, retirementAge: 100 });
    expect(Number.isFinite(result.combinedAnnualizedReturn)).toBe(true);
    expect(result.combinedAnnualizedReturn!).toBeLessThan(0);
  });

  it("handles total loss after cent rounding without zero times infinity", () => {
    const result = estimate({ expectedAnnualReturn: -0.99, currentAge: 18, retirementAge: 100 });
    expect(result.netWithdrawal).toBe(0);
    expect(result.combinedAnnualizedReturn).toBeCloseTo(-0.7, 10);
    expect(estimate({ expectedAnnualReturn: -0.99 }, { monthlyGross: 5_000 }).combinedAnnualizedReturn).toBe(-1);
  });

  it("does not invent a finite IRR when cent rounding makes the initial net cost zero", () => {
    const result = estimate({ contribution: 0.01, refundTiming: "immediate" }, { monthlyGross: 50_000.01 });
    expect(result.netContribution).toBe(0);
    expect(result.taxOnlyAnnualizedReturn).toBeNull();
  });
});

describe("personal pension validation", () => {
  it.each([
    { currentAge: 17 }, { currentAge: 40.5 }, { retirementAge: 40 },
    { retirementAge: 101 }, { contribution: -1 }, { contribution: 12_001 },
    { contribution: NaN }, { expectedAnnualReturn: -1 }, { expectedAnnualReturn: Infinity },
  ])("rejects invalid inputs %j", (change) => {
    expect(validatePensionInput({ ...DEFAULT_PENSION_INPUT, ...change })).not.toBeNull();
    expect(() => estimate(change)).toThrow(RangeError);
  });

  it("rejects invalid salary inputs instead of showing stale estimates", () => {
    expect(() => estimate({}, { monthlyGross: 0 })).toThrow(RangeError);
  });
});
