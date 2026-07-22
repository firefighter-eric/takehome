export const MONTHLY_BASIC_DEDUCTION = 5_000;

export type BonusTaxMode = "separate" | "combined";

export interface SalaryInput {
  monthlyGross: number;
  monthlySocialInsurance: number;
  monthlyHousingFund: number;
  monthlySpecialDeduction: number;
  months: number;
  yearEndBonusMonths: number;
  bonusTaxMode: BonusTaxMode;
}

export interface TaxBracket {
  upperBound: number;
  rate: number;
  quickDeduction: number;
}

export interface MonthlySalaryRow {
  month: number;
  gross: number;
  bonus: number;
  socialInsurance: number;
  housingFund: number;
  specialDeduction: number;
  cumulativeTaxableIncome: number;
  rate: number;
  tax: number;
  net: number;
}

export interface SalaryResult {
  rows: MonthlySalaryRow[];
  totalGross: number;
  totalTax: number;
  totalSocialAndHousing: number;
  totalNet: number;
  averageMonthlyNet: number;
  bonusGross: number;
  bonusTax: number;
  bonusNet: number;
  bonusTaxRate: number;
  bonusTaxMode: BonusTaxMode;
}

export const TAX_BRACKETS: TaxBracket[] = [
  { upperBound: 36_000, rate: 0.03, quickDeduction: 0 },
  { upperBound: 144_000, rate: 0.1, quickDeduction: 2_520 },
  { upperBound: 300_000, rate: 0.2, quickDeduction: 16_920 },
  { upperBound: 420_000, rate: 0.25, quickDeduction: 31_920 },
  { upperBound: 660_000, rate: 0.3, quickDeduction: 52_920 },
  { upperBound: 960_000, rate: 0.35, quickDeduction: 85_920 },
  { upperBound: Number.POSITIVE_INFINITY, rate: 0.45, quickDeduction: 181_920 },
];

export const BONUS_TAX_BRACKETS: TaxBracket[] = [
  { upperBound: 3_000, rate: 0.03, quickDeduction: 0 },
  { upperBound: 12_000, rate: 0.1, quickDeduction: 210 },
  { upperBound: 25_000, rate: 0.2, quickDeduction: 1_410 },
  { upperBound: 35_000, rate: 0.25, quickDeduction: 2_660 },
  { upperBound: 55_000, rate: 0.3, quickDeduction: 4_410 },
  { upperBound: 80_000, rate: 0.35, quickDeduction: 7_160 },
  { upperBound: Number.POSITIVE_INFINITY, rate: 0.45, quickDeduction: 15_160 },
];

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function getTaxBracket(taxableIncome: number): TaxBracket {
  return TAX_BRACKETS.find((bracket) => taxableIncome <= bracket.upperBound) ?? TAX_BRACKETS.at(-1)!;
}

export function calculateCumulativeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  const bracket = getTaxBracket(taxableIncome);
  return roundCurrency(Math.max(0, taxableIncome * bracket.rate - bracket.quickDeduction));
}

export function getBonusTaxBracket(bonusIncome: number): TaxBracket {
  const monthlyEquivalent = Math.max(0, bonusIncome) / 12;
  return (
    BONUS_TAX_BRACKETS.find((bracket) => monthlyEquivalent <= bracket.upperBound) ??
    BONUS_TAX_BRACKETS.at(-1)!
  );
}

export function calculateAnnualBonusTax(bonusIncome: number): number {
  if (bonusIncome <= 0) return 0;

  const bracket = getBonusTaxBracket(bonusIncome);
  return roundCurrency(Math.max(0, bonusIncome * bracket.rate - bracket.quickDeduction));
}

export function calculateSalary(input: SalaryInput): SalaryResult {
  let cumulativeTaxPaid = 0;
  const bonusGross = roundCurrency(input.monthlyGross * input.yearEndBonusMonths);
  const separateBonusTax =
    input.bonusTaxMode === "separate" ? calculateAnnualBonusTax(bonusGross) : 0;

  const rows = Array.from({ length: input.months }, (_, index): MonthlySalaryRow => {
    const month = index + 1;
    const isBonusMonth = month === input.months && bonusGross > 0;
    const bonus = isBonusMonth ? bonusGross : 0;
    const combinedBonus = isBonusMonth && input.bonusTaxMode === "combined" ? bonusGross : 0;
    const cumulativeGross = input.monthlyGross * month + combinedBonus;
    const cumulativeDeductions =
      (MONTHLY_BASIC_DEDUCTION +
        input.monthlySocialInsurance +
        input.monthlyHousingFund +
        input.monthlySpecialDeduction) *
      month;
    const cumulativeTaxableIncome = Math.max(0, cumulativeGross - cumulativeDeductions);
    const bracket = getTaxBracket(cumulativeTaxableIncome);
    const cumulativeTax = calculateCumulativeTax(cumulativeTaxableIncome);
    const salaryTax = roundCurrency(Math.max(0, cumulativeTax - cumulativeTaxPaid));
    const tax = roundCurrency(
      salaryTax + (isBonusMonth && input.bonusTaxMode === "separate" ? separateBonusTax : 0),
    );
    cumulativeTaxPaid = cumulativeTax;

    const net = roundCurrency(
      input.monthlyGross + bonus - input.monthlySocialInsurance - input.monthlyHousingFund - tax,
    );

    return {
      month,
      gross: input.monthlyGross,
      bonus,
      socialInsurance: input.monthlySocialInsurance,
      housingFund: input.monthlyHousingFund,
      specialDeduction: input.monthlySpecialDeduction,
      cumulativeTaxableIncome,
      rate: bracket.rate,
      tax,
      net,
    };
  });

  const totalGross = roundCurrency(rows.reduce((sum, row) => sum + row.gross, 0));
  const totalGrossWithBonus = roundCurrency(totalGross + bonusGross);
  const totalTax = roundCurrency(rows.reduce((sum, row) => sum + row.tax, 0));
  const totalSocialAndHousing = roundCurrency(
    rows.reduce((sum, row) => sum + row.socialInsurance + row.housingFund, 0),
  );
  const totalNet = roundCurrency(rows.reduce((sum, row) => sum + row.net, 0));
  const salaryTaxWithoutBonus = calculateCumulativeTax(
    Math.max(
      0,
      input.monthlyGross * input.months -
        (MONTHLY_BASIC_DEDUCTION +
          input.monthlySocialInsurance +
          input.monthlyHousingFund +
          input.monthlySpecialDeduction) *
          input.months,
    ),
  );
  const bonusTax = roundCurrency(Math.max(0, totalTax - salaryTaxWithoutBonus));

  return {
    rows,
    totalGross: totalGrossWithBonus,
    totalTax,
    totalSocialAndHousing,
    totalNet,
    averageMonthlyNet: roundCurrency(totalNet / input.months),
    bonusGross,
    bonusTax,
    bonusNet: roundCurrency(bonusGross - bonusTax),
    bonusTaxRate:
      input.bonusTaxMode === "separate" && bonusGross > 0
        ? getBonusTaxBracket(bonusGross).rate
        : bonusGross > 0
          ? bonusTax / bonusGross
          : 0,
    bonusTaxMode: input.bonusTaxMode,
  };
}

export function validateSalaryInput(input: SalaryInput): string | null {
  if (!Number.isFinite(input.monthlyGross) || input.monthlyGross <= 0) {
    return "请输入大于 0 的税前月薪。";
  }

  const deductions = [
    input.monthlySocialInsurance,
    input.monthlyHousingFund,
    input.monthlySpecialDeduction,
  ];
  if (deductions.some((value) => !Number.isFinite(value) || value < 0)) {
    return "各项扣除金额不能为负数。";
  }

  if (input.monthlySocialInsurance + input.monthlyHousingFund > input.monthlyGross) {
    return "个人社保与公积金合计不能超过税前月薪。";
  }

  if (!Number.isInteger(input.months) || input.months < 1 || input.months > 12) {
    return "计薪月份请输入 1 至 12 之间的整数。";
  }

  if (!Number.isFinite(input.yearEndBonusMonths) || input.yearEndBonusMonths < 0) {
    return "年终奖月数不能为负数。";
  }

  if (input.bonusTaxMode !== "separate" && input.bonusTaxMode !== "combined") {
    return "请选择有效的年终奖计税方式。";
  }

  return null;
}
