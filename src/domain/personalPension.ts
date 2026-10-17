import {
  calculateAnnualBonusTax,
  calculateCumulativeTax,
  MONTHLY_BASIC_DEDUCTION,
  validateSalaryInput,
  type BonusTaxMode,
  type SalaryInput,
} from "./salary";

export const PENSION_ANNUAL_LIMIT = 12_000;
export const PENSION_WITHDRAWAL_TAX_RATE = 0.03;
export const PENSION_POLICY_URL =
  "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5237110/content.html";

export interface PersonalPensionInput {
  currentAge: number;
  retirementAge: number;
  contribution: number;
  refundTiming: "next-year" | "immediate";
  expectedAnnualReturn: number;
}

export const DEFAULT_PENSION_INPUT: PersonalPensionInput = {
  currentAge: 40,
  retirementAge: 60,
  contribution: 12_000,
  refundTiming: "next-year",
  expectedAnnualReturn: 0,
};

export interface AnnualPensionIncome {
  annualGross: number;
  annualBonus: number;
  bonusTaxMode: BonusTaxMode;
  annualSocialAndHousing: number;
  annualSpecialDeduction: number;
}

export const EMPTY_ANNUAL_PENSION_INCOME: AnnualPensionIncome = {
  annualGross: 0,
  annualBonus: 0,
  bonusTaxMode: "separate",
  annualSocialAndHousing: 0,
  annualSpecialDeduction: 0,
};

export interface PensionCashFlow {
  year: number;
  amount: number;
}

export interface PersonalPensionResult {
  years: number;
  annualGross: number;
  taxableIncomeBefore: number;
  annualTaxBefore: number;
  annualTaxAfter: number;
  taxSaving: number;
  netContribution: number;
  taxOnlyWithdrawal: number;
  taxOnlyAnnualizedReturn: number | null;
  investmentBalance: number;
  withdrawalTax: number;
  netWithdrawal: number;
  combinedAnnualizedReturn: number | null;
  annualizedUplift: number | null;
  disposableCashAfter: number;
  cashFlows: PensionCashFlow[];
}

const currency = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;

export function validateAnnualPensionIncome(income: AnnualPensionIncome): string | null {
  if (!Number.isFinite(income.annualGross) || income.annualGross < 0) {
    return "全年税前收入请输入大于或等于 0 的金额。";
  }
  if (!Number.isFinite(income.annualBonus) || income.annualBonus < 0 || income.annualBonus > income.annualGross) {
    return "年终奖金额不能为负数，也不能超过全年税前收入。";
  }
  if ([income.annualSocialAndHousing, income.annualSpecialDeduction].some(value => !Number.isFinite(value) || value < 0)) {
    return "年度扣除金额请输入大于或等于 0 的金额。";
  }
  if (income.bonusTaxMode !== "separate" && income.bonusTaxMode !== "combined") {
    return "请选择有效的年终奖计税方式。";
  }
  return null;
}

export function annualPensionIncomeFromSalary(salary: SalaryInput): AnnualPensionIncome {
  const error = validateSalaryInput(salary);
  if (error) throw new RangeError(error);
  const annualBonus = currency(salary.monthlyGross * salary.yearEndBonusMonths);
  return {
    annualGross: currency(salary.monthlyGross * salary.months + salary.extraIncentive + annualBonus),
    annualBonus,
    bonusTaxMode: salary.bonusTaxMode,
    annualSocialAndHousing: currency((salary.monthlySocialInsurance + salary.monthlyHousingFund) * salary.months),
    annualSpecialDeduction: currency(salary.monthlySpecialDeduction * salary.months),
  };
}

export function validatePensionInput(input: PersonalPensionInput): string | null {
  if (!Number.isInteger(input.currentAge) || input.currentAge < 18 || input.currentAge > 100) {
    return "当前年龄请输入 18 至 100 岁之间的整数。";
  }
  if (!Number.isInteger(input.retirementAge) || input.retirementAge <= input.currentAge || input.retirementAge > 100) {
    return "预计领取年龄须大于当前年龄，且不超过 100 岁。";
  }
  if (!Number.isFinite(input.contribution) || input.contribution < 0 || input.contribution > PENSION_ANNUAL_LIMIT) {
    return "今年缴费金额请输入 0 至 12,000 元。";
  }
  if (input.refundTiming !== "next-year" && input.refundTiming !== "immediate") {
    return "请选择有效的抵税时间。";
  }
  if (!Number.isFinite(input.expectedAnnualReturn) || input.expectedAnnualReturn < -0.99 || input.expectedAnnualReturn > 1) {
    return "产品预期年化请输入 -99% 至 100% 之间的数值。";
  }
  return null;
}

// These cash flows have one initial outflow and later nonnegative receipts,
// so NPV is monotone in log(1 + r) and has a unique annualized return.
export function pensionAnnualizedReturn(
  contribution: number,
  taxSaving: number,
  refundYear: number,
  netWithdrawal: number,
  years: number,
): number | null {
  if (contribution === 0 || (refundYear === 0 && taxSaving >= contribution)) return null;
  if (netWithdrawal === 0 && (taxSaving === 0 || refundYear === 0)) return -1;
  let low = -32;
  let high = 32;
  for (let iteration = 0; iteration < 120; iteration++) {
    const logRate = (low + high) / 2;
    const npv = -contribution +
      (taxSaving > 0 ? taxSaving * Math.exp(-refundYear * logRate) : 0) +
      (netWithdrawal > 0 ? netWithdrawal * Math.exp(-years * logRate) : 0);
    if (npv > 0) low = logRate;
    else high = logRate;
  }
  const rate = Math.expm1((low + high) / 2);
  return Math.abs(rate) < 1e-12 ? 0 : rate;
}

export function calculatePersonalPension(
  salary: SalaryInput,
  input: PersonalPensionInput,
): PersonalPensionResult {
  return calculatePersonalPensionFromAnnualIncome(annualPensionIncomeFromSalary(salary), input);
}

export function calculatePersonalPensionFromAnnualIncome(
  income: AnnualPensionIncome,
  input: PersonalPensionInput,
): PersonalPensionResult {
  const error = validateAnnualPensionIncome(income) ?? validatePensionInput(input);
  if (error) throw new RangeError(error);

  const contribution = currency(input.contribution);
  const years = input.retirementAge - input.currentAge;
  const refundYear = input.refundTiming === "next-year" ? 1 : 0;
  const bonus = currency(income.annualBonus);
  const annualGross = currency(income.annualGross);
  const comprehensiveGross = annualGross - (income.bonusTaxMode === "separate" ? bonus : 0);
  const socialAndHousing = currency(income.annualSocialAndHousing);
  // Annual settlement uses the full 60,000 basic deduction. Other deductions
  // are annual totals, whether entered directly or imported from paid months.
  const taxableIncomeBefore = currency(Math.max(0,
    comprehensiveGross - MONTHLY_BASIC_DEDUCTION * 12 - socialAndHousing -
      income.annualSpecialDeduction,
  ));
  const separateBonusTax = income.bonusTaxMode === "separate" ? calculateAnnualBonusTax(bonus) : 0;
  const annualTaxBefore = currency(calculateCumulativeTax(taxableIncomeBefore) + separateBonusTax);
  const annualTaxAfter = currency(
    calculateCumulativeTax(Math.max(0, taxableIncomeBefore - contribution)) + separateBonusTax,
  );
  const taxSaving = currency(annualTaxBefore - annualTaxAfter);
  const taxOnlyWithdrawal = currency(contribution * (1 - PENSION_WITHDRAWAL_TAX_RATE));
  const investmentBalance = currency(contribution * (1 + input.expectedAnnualReturn) ** years);
  const withdrawalTax = currency(investmentBalance * PENSION_WITHDRAWAL_TAX_RATE);
  const netWithdrawal = currency(investmentBalance - withdrawalTax);
  const taxOnlyAnnualizedReturn = pensionAnnualizedReturn(
    contribution, taxSaving, refundYear, taxOnlyWithdrawal, years,
  );
  const combinedAnnualizedReturn = pensionAnnualizedReturn(
    contribution, taxSaving, refundYear, netWithdrawal, years,
  );

  return {
    years,
    annualGross,
    taxableIncomeBefore,
    annualTaxBefore,
    annualTaxAfter,
    taxSaving,
    netContribution: currency(contribution - taxSaving),
    taxOnlyWithdrawal,
    taxOnlyAnnualizedReturn,
    investmentBalance,
    withdrawalTax,
    netWithdrawal,
    combinedAnnualizedReturn,
    annualizedUplift: combinedAnnualizedReturn === null ? null : combinedAnnualizedReturn - input.expectedAnnualReturn,
    disposableCashAfter: currency(annualGross - socialAndHousing - annualTaxAfter - contribution),
    cashFlows: [
      { year: 0, amount: -contribution },
      { year: refundYear, amount: taxSaving },
      { year: years, amount: taxOnlyWithdrawal },
    ],
  };
}
