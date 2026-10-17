import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InfoDialog } from "./components/InfoDialog";
import { InfoIcon, ShieldIcon } from "./components/Icons";
import { JobComparison } from "./components/JobComparison";
import { ResultsPanel } from "./components/ResultsPanel";
import { SalaryForm } from "./components/SalaryForm";
import { PersonalPension } from "./components/PersonalPension";
import { PensionIncomeEditor } from "./components/PensionIncomeEditor";
import {
  calculateJobScenario,
  createDefaultJobScenario,
  DEFAULT_CONTRIBUTION_WAGE,
  DEFAULT_EMPLOYER_HOUSING_FUND_RATE,
  DEFAULT_HOUSING_FUND_RATE,
  DEFAULT_POLICY_ID,
  DEFAULT_SALARY_INPUT,
  type JobScenario,
} from "./domain/jobScenario";
import type { SalaryInput } from "./domain/salary";
import {
  annualPensionIncomeFromSalary,
  DEFAULT_PENSION_INPUT,
  EMPTY_ANNUAL_PENSION_INCOME,
  type AnnualPensionIncome,
  type PersonalPensionInput,
} from "./domain/personalPension";
import { loadTakeHomeState, saveTakeHomeState } from "./state/persistence";

const INITIAL_VALUES: SalaryInput = { ...DEFAULT_SALARY_INPUT };
const INITIAL_POLICY_ID = DEFAULT_POLICY_ID;
const INITIAL_CONTRIBUTION_WAGE = DEFAULT_CONTRIBUTION_WAGE;
const INITIAL_HOUSING_FUND_RATE = DEFAULT_HOUSING_FUND_RATE;
const INITIAL_EMPLOYER_HOUSING_FUND_RATE = DEFAULT_EMPLOYER_HOUSING_FUND_RATE;

type View = "single" | "compare" | "pension";

function readViewFromHash(): View {
  if (typeof window === "undefined") return "single";
  const route = window.location.hash.replace(/^#\/?/, "");
  if (route === "compare" || route === "pension") return route;
  return "single";
}

function App() {
  const [restored] = useState(() => loadTakeHomeState());
  const [view, setView] = useState<View>(readViewFromHash);
  const [draft, setDraft] = useState<SalaryInput>(() => restored?.draft ?? INITIAL_VALUES);
  const [pensionInput, setPensionInput] = useState<PersonalPensionInput>(
    () => restored?.pensionInput ?? { ...DEFAULT_PENSION_INPUT },
  );
  const [pensionIncome, setPensionIncome] = useState<AnnualPensionIncome | null>(
    () => restored?.pensionIncome ?? null,
  );
  const [policyId, setPolicyId] = useState(restored?.policyId ?? INITIAL_POLICY_ID);
  const [contributionWage, setContributionWage] = useState(
    restored?.contributionWage ?? INITIAL_CONTRIBUTION_WAGE,
  );
  const [housingFundRate, setHousingFundRate] = useState(
    restored?.housingFundRate ?? INITIAL_HOUSING_FUND_RATE,
  );
  const [housingFundRatesSynced, setHousingFundRatesSynced] = useState(
    restored?.housingFundRatesSynced ?? true,
  );
  const [employerHousingFundRate, setEmployerHousingFundRate] = useState(
    restored?.employerHousingFundRate ?? INITIAL_EMPLOYER_HOUSING_FUND_RATE,
  );
  const [infoOpen, setInfoOpen] = useState(false);
  const [scenarioA, setScenarioA] = useState<JobScenario>(
    () => restored?.scenarioA ?? createDefaultJobScenario("工作 A"),
  );
  const [scenarioB, setScenarioB] = useState<JobScenario>(
    () => restored?.scenarioB ?? createDefaultJobScenario("工作 B"),
  );
  const comparisonInitialized = useRef(restored !== null);

  const currentScenario = useMemo<JobScenario>(
    () => ({
      name: "当前工作",
      salary: draft,
      policyId,
      contributionWage,
      housingFundRate,
      employerHousingFundRate,
      housingFundRatesSynced,
    }),
    [
      contributionWage,
      draft,
      employerHousingFundRate,
      housingFundRate,
      housingFundRatesSynced,
      policyId,
    ],
  );
  const currentCalculation = useMemo(
    () => calculateJobScenario(currentScenario),
    [currentScenario],
  );
  const {
    policy,
    housingFundPolicy,
    socialEstimate,
    employerSocialEstimate,
    housingFundEstimate,
    employerHousingFundEstimate,
    effectiveInput,
    error,
    result,
  } = currentCalculation;
  const employerCost = {
    monthlySocialInsurance: employerSocialEstimate.total,
    monthlyHousingFund: employerHousingFundEstimate.personalAmount,
  };
  const currentAnnualIncome =
    error === null ? annualPensionIncomeFromSalary(effectiveInput) : null;
  const effectivePensionIncome =
    pensionIncome ?? currentAnnualIncome ?? EMPTY_ANNUAL_PENSION_INCOME;

  useEffect(() => {
    const syncView = () => setView(readViewFromHash());
    window.addEventListener("hashchange", syncView);
    window.addEventListener("popstate", syncView);
    return () => {
      window.removeEventListener("hashchange", syncView);
      window.removeEventListener("popstate", syncView);
    };
  }, []);

  useEffect(() => {
    saveTakeHomeState({
      draft,
      policyId,
      contributionWage,
      housingFundRate,
      employerHousingFundRate,
      housingFundRatesSynced,
      pensionInput,
      pensionIncome,
      scenarioA,
      scenarioB,
    });
  }, [
    contributionWage,
    draft,
    employerHousingFundRate,
    housingFundRate,
    housingFundRatesSynced,
    pensionIncome,
    pensionInput,
    policyId,
    scenarioA,
    scenarioB,
  ]);

  const navigate = useCallback((next: View) => {
    setView(next);
    if (typeof window === "undefined") return;
    const nextHash = next === "single" ? "" : `#/${next}`;
    if (window.location.hash === nextHash) return;
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
    window.history.pushState(null, "", nextUrl);
  }, []);

  const reset = () => {
    setDraft({ ...INITIAL_VALUES });
    setPolicyId(INITIAL_POLICY_ID);
    setContributionWage(INITIAL_CONTRIBUTION_WAGE);
    setHousingFundRate(INITIAL_HOUSING_FUND_RATE);
    setHousingFundRatesSynced(true);
    setEmployerHousingFundRate(INITIAL_EMPLOYER_HOUSING_FUND_RATE);
  };

  const closeInfo = useCallback(() => setInfoOpen(false), []);
  const currentJobScenario = useCallback(
    (name: string): JobScenario => ({
      name,
      salary: { ...draft },
      policyId,
      contributionWage,
      housingFundRate,
      employerHousingFundRate,
      housingFundRatesSynced,
    }),
    [
      contributionWage,
      draft,
      employerHousingFundRate,
      housingFundRate,
      housingFundRatesSynced,
      policyId,
    ],
  );

  const showComparison = () => {
    if (comparisonInitialized.current === false) {
      setScenarioA(currentJobScenario("工作 A"));
      setScenarioB(currentJobScenario("工作 B"));
      comparisonInitialized.current = true;
    }
    navigate("compare");
  };

  const useCurrentForA = () => {
    setScenarioA(currentJobScenario(scenarioA.name || "工作 A"));
    comparisonInitialized.current = true;
  };

  const showPension = () => {
    if (pensionIncome === null) {
      setPensionIncome(currentAnnualIncome ? { ...currentAnnualIncome } : { ...EMPTY_ANNUAL_PENSION_INCOME });
    }
    navigate("pension");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#top"
          aria-label="TakeHome 首页"
          onClick={(event) => {
            event.preventDefault();
            navigate("single");
          }}
        >
          <img
            className="brand-mark"
            src="/brand/takehome-logo.png"
            alt=""
            width="32"
            height="32"
          />
          <span>TakeHome</span>
          <i aria-hidden="true" />
          <small>税后工资计算器</small>
        </a>
        <nav className="view-switcher" aria-label="计算视图">
          <button
            type="button"
            aria-current={view === "single" ? "page" : undefined}
            onClick={() => navigate("single")}
          >
            单个工作
          </button>
          <button
            type="button"
            aria-current={view === "compare" ? "page" : undefined}
            onClick={showComparison}
          >
            工作对比
          </button>
          <button
            type="button"
            aria-current={view === "pension" ? "page" : undefined}
            onClick={showPension}
          >
            个人养老金
          </button>
        </nav>
        <button className="info-button" type="button" onClick={() => setInfoOpen(true)}>
          <InfoIcon />
          <span>计算说明</span>
        </button>
      </header>

      {view === "single" ? (
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
            housingFundRatesSynced={housingFundRatesSynced}
            onPolicyChange={setPolicyId}
            onContributionWageChange={setContributionWage}
            onHousingFundRateChange={(rate) => {
              setHousingFundRate(rate);
              if (housingFundRatesSynced) setEmployerHousingFundRate(rate);
            }}
            onEmployerHousingFundRateChange={setEmployerHousingFundRate}
            onHousingFundRatesSyncedChange={(synced) => {
              setHousingFundRatesSynced(synced);
              if (synced) setEmployerHousingFundRate(housingFundRate);
            }}
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
      ) : view === "compare" ? (
        <JobComparison
          key="comparison"
          scenarioA={scenarioA}
          scenarioB={scenarioB}
          onScenarioAChange={setScenarioA}
          onScenarioBChange={setScenarioB}
          onResetA={() => setScenarioA(createDefaultJobScenario("工作 A"))}
          onResetB={() => setScenarioB(createDefaultJobScenario("工作 B"))}
          onUseCurrentForA={useCurrentForA}
        />
      ) : (
        <main id="top" className="pension-view" aria-labelledby="pension-view-heading">
          <header className="pension-view-heading">
            <h1 id="pension-view-heading">个人养老金</h1>
            <p>算清今年的节税，看看这笔缴费持有到退休的年化收益。</p>
          </header>
          <PensionIncomeEditor
            income={effectivePensionIncome}
            onChange={setPensionIncome}
            canImport={currentAnnualIncome !== null}
            onImport={() => {
              if (currentAnnualIncome) setPensionIncome({ ...currentAnnualIncome });
            }}
          />
          <PersonalPension
            income={effectivePensionIncome}
            input={pensionInput}
            onChange={setPensionInput}
          />
        </main>
      )}

      <footer className="page-footer">
        <ShieldIcon />
        <span>
          {view === "pension"
            ? "按年度汇算和单笔现金流估算，结果仅供参考；输入会自动保存在本机"
            : "按累计预扣法估算，结果仅供参考；输入会自动保存在本机"}
        </span>
      </footer>

      <InfoDialog open={infoOpen} onClose={closeInfo} />
    </div>
  );
}

export default App;
