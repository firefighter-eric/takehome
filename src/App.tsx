import { useCallback, useEffect, useState } from "react";
import { InfoDialog } from "./components/InfoDialog";
import { InfoIcon, ShieldIcon } from "./components/Icons";
import { ResultsPanel } from "./components/ResultsPanel";
import { SalaryForm } from "./components/SalaryForm";
import {
  calculateSalary,
  validateSalaryInput,
  type SalaryInput,
} from "./domain/salary";
import {
  estimateEmployerSocialInsurance,
  estimateSocialInsurance,
  getSocialSecurityPolicy,
} from "./domain/socialSecurity";
import { estimateHousingFund, getHousingFundPolicy } from "./domain/housingFund";

const INITIAL_VALUES: SalaryInput = {
  monthlyGross: 75_000,
  monthlySocialInsurance: 3_500,
  monthlyHousingFund: 2_100,
  monthlySpecialDeduction: 0,
  months: 12,
  yearEndBonusMonths: 3,
  extraIncentive: 0,
  bonusTaxMode: "separate",
};

const INITIAL_POLICY_ID = "shanghai";
const INITIAL_CONTRIBUTION_WAGE = 75_000;
const INITIAL_HOUSING_FUND_RATE = 0.12;
const INITIAL_EMPLOYER_HOUSING_FUND_RATE = 0.12;
const INITIAL_SOCIAL_ESTIMATE = estimateSocialInsurance(
  getSocialSecurityPolicy(INITIAL_POLICY_ID),
  INITIAL_CONTRIBUTION_WAGE,
);
const INITIAL_HOUSING_FUND_ESTIMATE = estimateHousingFund(
  getHousingFundPolicy(INITIAL_POLICY_ID),
  INITIAL_CONTRIBUTION_WAGE,
  INITIAL_HOUSING_FUND_RATE,
);
const INITIAL_EMPLOYER_SOCIAL_ESTIMATE = estimateEmployerSocialInsurance(
  getSocialSecurityPolicy(INITIAL_POLICY_ID),
  INITIAL_CONTRIBUTION_WAGE,
);
const INITIAL_EMPLOYER_HOUSING_FUND_ESTIMATE = estimateHousingFund(
  getHousingFundPolicy(INITIAL_POLICY_ID),
  INITIAL_CONTRIBUTION_WAGE,
  INITIAL_EMPLOYER_HOUSING_FUND_RATE,
);
const INITIAL_RESULT = calculateSalary({
  ...INITIAL_VALUES,
  monthlySocialInsurance: INITIAL_SOCIAL_ESTIMATE.total,
  monthlyHousingFund: INITIAL_HOUSING_FUND_ESTIMATE.personalAmount,
});
const INITIAL_EMPLOYER_COST = {
  monthlySocialInsurance: INITIAL_EMPLOYER_SOCIAL_ESTIMATE.total,
  monthlyHousingFund: INITIAL_EMPLOYER_HOUSING_FUND_ESTIMATE.personalAmount,
};

function App() {
  const [draft, setDraft] = useState<SalaryInput>(INITIAL_VALUES);
  const [policyId, setPolicyId] = useState(INITIAL_POLICY_ID);
  const [contributionWage, setContributionWage] = useState(INITIAL_CONTRIBUTION_WAGE);
  const [housingFundRate, setHousingFundRate] = useState(INITIAL_HOUSING_FUND_RATE);
  const [employerHousingFundRate, setEmployerHousingFundRate] = useState(
    INITIAL_EMPLOYER_HOUSING_FUND_RATE,
  );
  const [result, setResult] = useState(() => INITIAL_RESULT);
  const [employerCost, setEmployerCost] = useState(() => INITIAL_EMPLOYER_COST);
  const [error, setError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const policy = getSocialSecurityPolicy(policyId);
  const housingFundPolicy = getHousingFundPolicy(policyId);
  const socialEstimate = estimateSocialInsurance(policy, contributionWage);
  const employerSocialEstimate = estimateEmployerSocialInsurance(policy, contributionWage);
  const housingFundEstimate = estimateHousingFund(
    housingFundPolicy,
    contributionWage,
    housingFundRate,
  );
  const employerHousingFundEstimate = estimateHousingFund(
    housingFundPolicy,
    contributionWage,
    employerHousingFundRate,
  );
  const effectiveInput: SalaryInput = {
    ...draft,
    monthlySocialInsurance: socialEstimate.total,
    monthlyHousingFund: housingFundEstimate.personalAmount,
  };

  useEffect(() => {
    const validationError =
      !Number.isFinite(contributionWage) || contributionWage <= 0
        ? "请输入大于 0 的上年度月平均工资。"
        : validateSalaryInput(effectiveInput);
    setError(validationError);
    if (validationError) return;

    setResult(calculateSalary(effectiveInput));
    setEmployerCost({
      monthlySocialInsurance: employerSocialEstimate.total,
      monthlyHousingFund: employerHousingFundEstimate.personalAmount,
    });
  }, [
    contributionWage,
    draft,
    employerHousingFundRate,
    housingFundRate,
    policyId,
  ]);

  const reset = () => {
    setDraft(INITIAL_VALUES);
    setPolicyId(INITIAL_POLICY_ID);
    setContributionWage(INITIAL_CONTRIBUTION_WAGE);
    setHousingFundRate(INITIAL_HOUSING_FUND_RATE);
    setEmployerHousingFundRate(INITIAL_EMPLOYER_HOUSING_FUND_RATE);
    setResult(INITIAL_RESULT);
    setEmployerCost(INITIAL_EMPLOYER_COST);
    setError(null);
  };

  const closeInfo = useCallback(() => setInfoOpen(false), []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="TakeHome 首页">
          <span>TakeHome</span>
          <i aria-hidden="true" />
          <small>税后工资计算器</small>
        </a>
        <button className="info-button" type="button" onClick={() => setInfoOpen(true)}>
          <InfoIcon />
          计算说明
        </button>
      </header>

      <main id="top" className="calculator-layout">
        <SalaryForm
          values={draft}
          error={error}
          onChange={setDraft}
          onReset={reset}
          policy={policy}
          housingFundPolicy={housingFundPolicy}
          contributionWage={contributionWage}
          housingFundEstimate={housingFundEstimate}
          employerHousingFundEstimate={employerHousingFundEstimate}
          housingFundRate={housingFundEstimate.rate}
          employerHousingFundRate={employerHousingFundEstimate.rate}
          onPolicyChange={setPolicyId}
          onContributionWageChange={setContributionWage}
          onHousingFundRateChange={setHousingFundRate}
          onEmployerHousingFundRateChange={setEmployerHousingFundRate}
        />
        <ResultsPanel
          result={result}
          employerCost={employerCost}
          contributionDetails={{
            policy,
            socialEstimate,
            employerSocialEstimate,
            housingFundPolicy,
            housingFundEstimate,
            employerHousingFundEstimate,
            housingFundRate: housingFundEstimate.rate,
            employerHousingFundRate: employerHousingFundEstimate.rate,
          }}
        />
      </main>

      <footer className="page-footer">
        <ShieldIcon />
        <span>按累计预扣法估算，结果仅供参考</span>
      </footer>

      <InfoDialog open={infoOpen} onClose={closeInfo} />
    </div>
  );
}

export default App;
