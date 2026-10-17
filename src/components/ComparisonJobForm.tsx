import {
  getHousingFundRateOptions,
  type HousingFundPolicy,
} from "../domain/housingFund";
import type { JobScenario } from "../domain/jobScenario";
import type { SalaryInput } from "../domain/salary";
import {
  SOCIAL_SECURITY_POLICIES,
  type SocialSecurityPolicy,
} from "../domain/socialSecurity";
import { InfoIcon } from "./Icons";
import { NumericField } from "./NumericField";
import { NumberInput } from "./NumberInput";

interface ComparisonJobFormProps {
  index: "A" | "B";
  scenario: JobScenario;
  policy: SocialSecurityPolicy;
  housingFundPolicy: HousingFundPolicy;
  error: string | null;
  onChange: (scenario: JobScenario) => void;
  onReset: () => void;
}

export function ComparisonJobForm({
  index,
  scenario,
  policy,
  housingFundPolicy,
  error,
  onChange,
  onReset,
}: ComparisonJobFormProps) {
  const idPrefix = `compare-${index.toLowerCase()}`;
  const updateScenario = <Key extends keyof JobScenario>(
    key: Key,
    value: JobScenario[Key],
  ) => {
    onChange({ ...scenario, [key]: value });
  };
  const updateSalary = <Key extends keyof SalaryInput>(
    key: Key,
    value: SalaryInput[Key],
  ) => {
    onChange({
      ...scenario,
      salary: { ...scenario.salary, [key]: value },
    });
  };
  const rateOptions = getHousingFundRateOptions(housingFundPolicy);

  return (
    <section className={`comparison-job-card comparison-job-${index.toLowerCase()}`}>
      <header className="comparison-job-heading">
        <span className="job-letter" aria-hidden="true">
          {index}
        </span>
        <div>
          <label htmlFor={`${idPrefix}-name`}>工作名称</label>
          <input
            id={`${idPrefix}-name`}
            className="job-name-input"
            aria-label={`工作 ${index} 名称`}
            value={scenario.name}
            maxLength={24}
            autoComplete="off"
            onChange={(event) => updateScenario("name", event.target.value)}
          />
        </div>
        <button type="button" className="comparison-reset" onClick={onReset}>
          恢复默认
        </button>
      </header>

      <div className="comparison-form-grid">
        <NumericField
          id={`${idPrefix}-gross`}
          label="税前月薪"
          ariaLabel={`工作 ${index} 税前月薪`}
          value={scenario.salary.monthlyGross}
          unit="元/月"
          onChange={(value) => updateSalary("monthlyGross", value)}
        />

        <div className="field-group">
          <label htmlFor={`${idPrefix}-city`}>工作城市</label>
          <select
            id={`${idPrefix}-city`}
            className="select-control"
            aria-label={`工作 ${index} 工作城市`}
            value={scenario.policyId}
            onChange={(event) => updateScenario("policyId", event.target.value)}
          >
            {SOCIAL_SECURITY_POLICIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.city} · {item.province}
              </option>
            ))}
          </select>
        </div>

        <NumericField
          id={`${idPrefix}-contribution-wage`}
          label="上年度月均工资"
          ariaLabel={`工作 ${index} 上年度月均工资`}
          hint="社保、公积金基数"
          value={scenario.contributionWage}
          unit="元/月"
          onChange={(value) => updateScenario("contributionWage", value)}
        />

        <div className="field-group">
          <div className="housing-fund-label-row">
            <label htmlFor={`${idPrefix}-personal-fund-rate`}>公积金比例</label>
            <label className="housing-fund-sync">
              <input
                type="checkbox"
                aria-label={`工作 ${index} 同步个人与公司公积金比例`}
                checked={scenario.housingFundRatesSynced}
                onChange={(event) => onChange({
                  ...scenario,
                  housingFundRatesSynced: event.target.checked,
                  employerHousingFundRate: event.target.checked
                    ? scenario.housingFundRate
                    : scenario.employerHousingFundRate,
                })}
              />
              <span>同步比例</span>
            </label>
          </div>
          <div className="housing-fund-auto-control">
            <select
              id={`${idPrefix}-personal-fund-rate`}
              aria-label={`工作 ${index} 个人公积金缴存比例`}
              value={scenario.housingFundRate}
              onChange={(event) => {
                const rate = Number(event.target.value);
                onChange({
                  ...scenario,
                  housingFundRate: rate,
                  employerHousingFundRate: scenario.housingFundRatesSynced
                    ? rate
                    : scenario.employerHousingFundRate,
                });
              }}
            >
              {rateOptions.map((rate) => (
                <option key={rate} value={rate}>
                  个人 {Math.round(rate * 100)}%
                </option>
              ))}
            </select>
            <select
              aria-label={`工作 ${index} 公司公积金缴存比例`}
              value={scenario.housingFundRatesSynced ? scenario.housingFundRate : scenario.employerHousingFundRate}
              disabled={scenario.housingFundRatesSynced}
              title={scenario.housingFundRatesSynced ? "取消同步后可自定义公司比例" : undefined}
              onChange={(event) =>
                updateScenario("employerHousingFundRate", Number(event.target.value))
              }
            >
              {rateOptions.map((rate) => (
                <option key={rate} value={rate}>
                  公司 {Math.round(rate * 100)}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <NumericField
          id={`${idPrefix}-special-deduction`}
          label="专项附加扣除"
          ariaLabel={`工作 ${index} 专项附加扣除`}
          value={scenario.salary.monthlySpecialDeduction}
          unit="元/月"
          onChange={(value) => updateSalary("monthlySpecialDeduction", value)}
        />

        <NumericField
          id={`${idPrefix}-extra-incentive`}
          label="额外激励"
          ariaLabel={`工作 ${index} 额外激励`}
          hint="末月发放"
          value={scenario.salary.extraIncentive}
          unit="元"
          onChange={(value) => updateSalary("extraIncentive", value)}
        />

        <div className="field-group comparison-period-field">
          <div className="compound-field-label">
            <span>计薪 / 年终奖</span>
            <select
              className="bonus-tax-select"
              aria-label={`工作 ${index} 年终奖计税方式`}
              value={scenario.salary.bonusTaxMode}
              onChange={(event) =>
                updateSalary(
                  "bonusTaxMode",
                  event.target.value as SalaryInput["bonusTaxMode"],
                )
              }
            >
              <option value="separate">单独计税</option>
              <option value="combined">并入综合所得</option>
            </select>
          </div>
          <div className="dual-numeric-control">
            <div>
              <NumberInput
                aria-label={`工作 ${index} 计薪月份`}
                inputMode="numeric"
                min="1"
                max="12"
                value={scenario.salary.months}
                onValueChange={(value) => updateSalary("months", value)}
              />
              <span aria-hidden="true">薪月</span>
            </div>
            <div>
              <NumberInput
                aria-label={`工作 ${index} 年终奖月数`}
                inputMode="decimal"
                min="0"
                step="0.1"
                value={scenario.salary.yearEndBonusMonths}
                onValueChange={(value) => updateSalary("yearEndBonusMonths", value)}
              />
              <span aria-hidden="true">奖月</span>
            </div>
          </div>
        </div>
      </div>

      <p className="comparison-policy-note">
        {policy.city}社保基数范围 ¥{policy.baseMin.toLocaleString("zh-CN")}–¥
        {policy.baseMax.toLocaleString("zh-CN")}
      </p>

      <div className="comparison-error" aria-live="polite">
        {error ? (
          <p role="alert">
            <InfoIcon />
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
