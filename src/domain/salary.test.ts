import { describe, expect, it } from "vitest";
import {
  calculateAnnualBonusTax,
  calculateCumulativeTax,
  calculateSalary,
  getTaxBracket,
  validateSalaryInput,
  type SalaryInput,
} from "./salary";

const sampleInput: SalaryInput = {
  monthlyGross: 35_000,
  monthlySocialInsurance: 3_500,
  monthlyHousingFund: 2_100,
  monthlySpecialDeduction: 2_000,
  months: 12,
  yearEndBonusMonths: 0,
  bonusTaxMode: "separate",
};

describe("calculateSalary", () => {
  it("deducts personal social insurance and housing fund before calculating tax", () => {
    const result = calculateSalary({
      monthlyGross: 35_000,
      monthlySocialInsurance: 3_675,
      monthlyHousingFund: 2_450,
      monthlySpecialDeduction: 2_000,
      months: 1,
      yearEndBonusMonths: 0,
      bonusTaxMode: "separate",
    });

    expect(result.rows[0].cumulativeTaxableIncome).toBe(21_875);
    expect(result.rows[0].tax).toBe(656.25);
    expect(result.rows[0].net).toBe(28_218.75);
  });

  it("uses cumulative withholding across tax bracket changes", () => {
    const result = calculateSalary(sampleInput);

    expect(result.rows).toHaveLength(12);
    expect(result.rows[0].tax).toBe(672);
    expect(result.rows[1].tax).toBe(1_288);
    expect(result.rows[6].tax).toBe(3_520);
    expect(result.rows[11].tax).toBe(4_480);
    expect(result.totalTax).toBe(36_840);
    expect(result.totalNet).toBe(315_960);
    expect(result.averageMonthlyNet).toBe(26_330);
  });

  it("keeps the monthly withholding stable inside the first bracket", () => {
    const result = calculateSalary({
      monthlyGross: 10_000,
      monthlySocialInsurance: 2_000,
      monthlyHousingFund: 0,
      monthlySpecialDeduction: 0,
      months: 12,
      yearEndBonusMonths: 0,
      bonusTaxMode: "separate",
    });

    expect(result.rows.every((row) => row.tax === 90)).toBe(true);
    expect(result.totalTax).toBe(1_080);
  });

  it("never creates negative tax when deductions exceed taxable income", () => {
    const result = calculateSalary({
      monthlyGross: 4_000,
      monthlySocialInsurance: 400,
      monthlyHousingFund: 200,
      monthlySpecialDeduction: 2_000,
      months: 3,
      yearEndBonusMonths: 0,
      bonusTaxMode: "separate",
    });

    expect(result.rows.every((row) => row.tax === 0)).toBe(true);
    expect(result.totalNet).toBe(10_200);
  });

  it("taxes a year-end bonus separately without another month of deductions", () => {
    const result = calculateSalary({
      ...sampleInput,
      yearEndBonusMonths: 2,
      bonusTaxMode: "separate",
    });

    expect(result.bonusGross).toBe(70_000);
    expect(result.bonusTax).toBe(6_790);
    expect(result.bonusNet).toBe(63_210);
    expect(result.totalGross).toBe(490_000);
    expect(result.totalTax).toBe(43_630);
    expect(result.totalNet).toBe(379_170);
    expect(result.rows[11].bonus).toBe(70_000);
    expect(result.rows[11].tax).toBe(11_270);
  });

  it("can merge the bonus into comprehensive income", () => {
    const result = calculateSalary({
      ...sampleInput,
      yearEndBonusMonths: 2,
      bonusTaxMode: "combined",
    });

    expect(result.bonusGross).toBe(70_000);
    expect(result.bonusTax).toBe(15_940);
    expect(result.totalTax).toBe(52_780);
    expect(result.totalNet).toBe(370_020);
    expect(result.rows[11].cumulativeTaxableIncome).toBe(338_800);
  });
});

describe("tax brackets", () => {
  it("applies the official thresholds and quick deductions", () => {
    expect(getTaxBracket(36_000).rate).toBe(0.03);
    expect(getTaxBracket(36_000.01).rate).toBe(0.1);
    expect(calculateCumulativeTax(144_000)).toBe(11_880);
    expect(calculateCumulativeTax(144_000.01)).toBe(11_880);
  });

  it("uses the monthly-converted bracket for a separately taxed bonus", () => {
    expect(calculateAnnualBonusTax(36_000)).toBe(1_080);
    expect(calculateAnnualBonusTax(36_000.01)).toBe(3_390);
    expect(calculateAnnualBonusTax(70_000)).toBe(6_790);
  });
});

describe("validateSalaryInput", () => {
  it("rejects invalid months and impossible cash deductions", () => {
    expect(validateSalaryInput({ ...sampleInput, months: 13 })).toContain("1 至 12");
    expect(
      validateSalaryInput({
        ...sampleInput,
        monthlySocialInsurance: 30_000,
        monthlyHousingFund: 10_000,
      }),
    ).toContain("不能超过");
    expect(validateSalaryInput({ ...sampleInput, yearEndBonusMonths: -1 })).toContain("不能为负");
  });
});
