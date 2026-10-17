import { estimateHousingFund, getHousingFundPolicy } from "./housingFund";
import {
  calculateSalary,
  validateSalaryInput,
  type SalaryInput,
  type SalaryResult,
} from "./salary";
import {
  estimateEmployerSocialInsurance,
  estimateSocialInsurance,
  getSocialSecurityPolicy,
  type EmployerSocialSecurityEstimate,
  type SocialSecurityEstimate,
  type SocialSecurityPolicy,
} from "./socialSecurity";
import type { HousingFundEstimate, HousingFundPolicy } from "./housingFund";

export interface JobScenario {
  name: string;
  salary: SalaryInput;
  policyId: string;
  contributionWage: number;
  housingFundRate: number;
  employerHousingFundRate: number;
  housingFundRatesSynced: boolean;
}

export interface CalculatedJobScenario {
  scenario: JobScenario;
  policy: SocialSecurityPolicy;
  housingFundPolicy: HousingFundPolicy;
  socialEstimate: SocialSecurityEstimate;
  employerSocialEstimate: EmployerSocialSecurityEstimate;
  housingFundEstimate: HousingFundEstimate;
  employerHousingFundEstimate: HousingFundEstimate;
  effectiveInput: SalaryInput;
  error: string | null;
  result: SalaryResult | null;
  monthlyEmployerContribution: number;
  totalCompanyCost: number | null;
}

export const DEFAULT_SALARY_INPUT: SalaryInput = {
  monthlyGross: 75_000,
  monthlySocialInsurance: 3_500,
  monthlyHousingFund: 2_100,
  monthlySpecialDeduction: 0,
  months: 12,
  yearEndBonusMonths: 3,
  extraIncentive: 0,
  bonusTaxMode: "separate",
};

export const DEFAULT_POLICY_ID = "shanghai";
export const DEFAULT_CONTRIBUTION_WAGE = 75_000;
export const DEFAULT_HOUSING_FUND_RATE = 0.12;
export const DEFAULT_EMPLOYER_HOUSING_FUND_RATE = DEFAULT_HOUSING_FUND_RATE;

export function createDefaultJobScenario(name: string): JobScenario {
  return {
    name,
    salary: { ...DEFAULT_SALARY_INPUT },
    policyId: DEFAULT_POLICY_ID,
    contributionWage: DEFAULT_CONTRIBUTION_WAGE,
    housingFundRate: DEFAULT_HOUSING_FUND_RATE,
    employerHousingFundRate: DEFAULT_EMPLOYER_HOUSING_FUND_RATE,
    housingFundRatesSynced: true,
  };
}

export function calculateJobScenario(scenario: JobScenario): CalculatedJobScenario {
  const policy = getSocialSecurityPolicy(scenario.policyId);
  const housingFundPolicy = getHousingFundPolicy(scenario.policyId);
  const socialEstimate = estimateSocialInsurance(policy, scenario.contributionWage);
  const employerSocialEstimate = estimateEmployerSocialInsurance(
    policy,
    scenario.contributionWage,
  );
  const housingFundEstimate = estimateHousingFund(
    housingFundPolicy,
    scenario.contributionWage,
    scenario.housingFundRate,
  );
  const employerHousingFundEstimate = estimateHousingFund(
    housingFundPolicy,
    scenario.contributionWage,
    scenario.housingFundRatesSynced
      ? scenario.housingFundRate
      : scenario.employerHousingFundRate,
  );
  const effectiveInput: SalaryInput = {
    ...scenario.salary,
    monthlySocialInsurance: socialEstimate.total,
    monthlyHousingFund: housingFundEstimate.personalAmount,
  };
  const error =
    !Number.isFinite(scenario.contributionWage) || scenario.contributionWage <= 0
      ? "请输入大于 0 的上年度月平均工资。"
      : validateSalaryInput(effectiveInput);
  const result = error ? null : calculateSalary(effectiveInput);
  const monthlyEmployerContribution =
    employerSocialEstimate.total + employerHousingFundEstimate.personalAmount;

  return {
    scenario,
    policy,
    housingFundPolicy,
    socialEstimate,
    employerSocialEstimate,
    housingFundEstimate,
    employerHousingFundEstimate,
    effectiveInput,
    error,
    result,
    monthlyEmployerContribution,
    totalCompanyCost: result
      ? result.totalGross + monthlyEmployerContribution * effectiveInput.months
      : null,
  };
}
