import { getHousingFundPolicy } from "../domain/housingFund";
import {
  createDefaultJobScenario,
  DEFAULT_CONTRIBUTION_WAGE,
  DEFAULT_EMPLOYER_HOUSING_FUND_RATE,
  DEFAULT_HOUSING_FUND_RATE,
  DEFAULT_POLICY_ID,
  DEFAULT_SALARY_INPUT,
  type JobScenario,
} from "../domain/jobScenario";
import {
  DEFAULT_PENSION_INPUT,
  EMPTY_ANNUAL_PENSION_INCOME,
  type AnnualPensionIncome,
  type PersonalPensionInput,
} from "../domain/personalPension";
import type { SalaryInput } from "../domain/salary";
import { getSocialSecurityPolicy } from "../domain/socialSecurity";

export const STORAGE_KEY = "takehome:state:v1";
const STORAGE_VERSION = 1;

export interface PersistedTakeHomeState {
  draft: SalaryInput;
  policyId: string;
  contributionWage: number;
  housingFundRate: number;
  employerHousingFundRate: number;
  housingFundRatesSynced: boolean;
  pensionInput: PersonalPensionInput;
  pensionIncome: AnnualPensionIncome | null;
  scenarioA: JobScenario;
  scenarioB: JobScenario;
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && Array.isArray(value) === false;
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function bonusMode(value: unknown, fallback: SalaryInput["bonusTaxMode"]) {
  return value === "separate" || value === "combined" ? value : fallback;
}

function salary(value: unknown, fallback: SalaryInput): SalaryInput {
  if (isRecord(value) === false) return { ...fallback };
  return {
    monthlyGross: num(value.monthlyGross, fallback.monthlyGross),
    monthlySocialInsurance: num(value.monthlySocialInsurance, fallback.monthlySocialInsurance),
    monthlyHousingFund: num(value.monthlyHousingFund, fallback.monthlyHousingFund),
    monthlySpecialDeduction: num(value.monthlySpecialDeduction, fallback.monthlySpecialDeduction),
    months: num(value.months, fallback.months),
    yearEndBonusMonths: num(value.yearEndBonusMonths, fallback.yearEndBonusMonths),
    extraIncentive: num(value.extraIncentive, fallback.extraIncentive),
    bonusTaxMode: bonusMode(value.bonusTaxMode, fallback.bonusTaxMode),
  };
}

function scenario(value: unknown, fallbackName: string): JobScenario {
  const fallback = createDefaultJobScenario(fallbackName);
  if (isRecord(value) === false) return fallback;
  const requestedPolicy = str(value.policyId, fallback.policyId);
  const policyId =
    getSocialSecurityPolicy(requestedPolicy).id === requestedPolicy &&
    getHousingFundPolicy(requestedPolicy).id === requestedPolicy
      ? requestedPolicy
      : fallback.policyId;
  return {
    name: str(value.name, fallback.name),
    salary: salary(value.salary, fallback.salary),
    policyId,
    contributionWage: num(value.contributionWage, fallback.contributionWage),
    housingFundRate: num(value.housingFundRate, fallback.housingFundRate),
    employerHousingFundRate: num(
      value.employerHousingFundRate,
      fallback.employerHousingFundRate,
    ),
    housingFundRatesSynced: bool(value.housingFundRatesSynced, fallback.housingFundRatesSynced),
  };
}

function personalPensionInput(value: unknown): PersonalPensionInput {
  if (isRecord(value) === false) return { ...DEFAULT_PENSION_INPUT };
  return {
    currentAge: num(value.currentAge, DEFAULT_PENSION_INPUT.currentAge),
    retirementAge: num(value.retirementAge, DEFAULT_PENSION_INPUT.retirementAge),
    contribution: num(value.contribution, DEFAULT_PENSION_INPUT.contribution),
    refundTiming: value.refundTiming === "immediate" ? "immediate" : "next-year",
    expectedAnnualReturn: num(
      value.expectedAnnualReturn,
      DEFAULT_PENSION_INPUT.expectedAnnualReturn,
    ),
  };
}

function annualPensionIncome(value: unknown): AnnualPensionIncome | null {
  if (value === null || value === undefined) return null;
  if (isRecord(value) === false) return { ...EMPTY_ANNUAL_PENSION_INCOME };
  return {
    annualGross: num(value.annualGross, EMPTY_ANNUAL_PENSION_INCOME.annualGross),
    annualBonus: num(value.annualBonus, EMPTY_ANNUAL_PENSION_INCOME.annualBonus),
    bonusTaxMode: bonusMode(
      value.bonusTaxMode,
      EMPTY_ANNUAL_PENSION_INCOME.bonusTaxMode,
    ),
    annualSocialAndHousing: num(
      value.annualSocialAndHousing,
      EMPTY_ANNUAL_PENSION_INCOME.annualSocialAndHousing,
    ),
    annualSpecialDeduction: num(
      value.annualSpecialDeduction,
      EMPTY_ANNUAL_PENSION_INCOME.annualSpecialDeduction,
    ),
  };
}

export function parsePersistedState(raw: string): PersistedTakeHomeState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (isRecord(parsed) === false || parsed.version !== STORAGE_VERSION) return null;
    const requestedPolicy = str(parsed.policyId, DEFAULT_POLICY_ID);
    const policyId =
      getSocialSecurityPolicy(requestedPolicy).id === requestedPolicy &&
      getHousingFundPolicy(requestedPolicy).id === requestedPolicy
        ? requestedPolicy
        : DEFAULT_POLICY_ID;
    return {
      draft: salary(parsed.draft, DEFAULT_SALARY_INPUT),
      policyId,
      contributionWage: num(parsed.contributionWage, DEFAULT_CONTRIBUTION_WAGE),
      housingFundRate: num(parsed.housingFundRate, DEFAULT_HOUSING_FUND_RATE),
      employerHousingFundRate: num(
        parsed.employerHousingFundRate,
        DEFAULT_EMPLOYER_HOUSING_FUND_RATE,
      ),
      housingFundRatesSynced: bool(parsed.housingFundRatesSynced, true),
      pensionInput: personalPensionInput(parsed.pensionInput),
      pensionIncome: annualPensionIncome(parsed.pensionIncome),
      scenarioA: scenario(parsed.scenarioA, "工作 A"),
      scenarioB: scenario(parsed.scenarioB, "工作 B"),
    };
  } catch {
    return null;
  }
}

export function loadTakeHomeState(): PersistedTakeHomeState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parsePersistedState(raw) : null;
  } catch {
    return null;
  }
}

export function saveTakeHomeState(state: PersistedTakeHomeState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, ...state }),
    );
  } catch {
    // Storage may be unavailable in private mode or when the quota is full.
  }
}
