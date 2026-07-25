import {
  getHousingFundRateOptions,
  type HousingFundEstimate,
  type HousingFundPolicy,
} from "../domain/housingFund";
import type { SalaryInput } from "../domain/salary";
import {
  SOCIAL_SECURITY_POLICIES,
  type SocialSecurityPolicy,
} from "../domain/socialSecurity";
import { InfoIcon } from "./Icons";
import { NumericField } from "./NumericField";

const compactMoney = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
});

function percent(value: number): string {
  return `${Number((value * 100).toFixed(2))}%`;
}

interface SalaryFormProps {
  values: SalaryInput;
  error: string | null;
  onChange: (values: SalaryInput) => void;
  onReset: () => void;
  policy: SocialSecurityPolicy;
  housingFundPolicy: HousingFundPolicy;
  contributionWage: number;
  housingFundEstimate: HousingFundEstimate;
  employerHousingFundEstimate: HousingFundEstimate;
  housingFundRate: number;
  employerHousingFundRate: number;
  onPolicyChange: (policyId: string) => void;
  onContributionWageChange: (value: number) => void;
  onHousingFundRateChange: (rate: number) => void;
  onEmployerHousingFundRateChange: (rate: number) => void;
}

export function SalaryForm({
  values,
  error,
  onChange,
  onReset,
  policy,
  housingFundPolicy,
  contributionWage,
  housingFundEstimate,
  employerHousingFundEstimate,
  housingFundRate,
  employerHousingFundRate,
  onPolicyChange,
  onContributionWageChange,
  onHousingFundRateChange,
  onEmployerHousingFundRateChange,
}: SalaryFormProps) {
  const update = <Key extends keyof SalaryInput>(key: Key, value: SalaryInput[Key]) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <aside className="input-panel" aria-labelledby="salary-form-heading">
      <form onSubmit={(event) => event.preventDefault()} noValidate>
        <h1 id="salary-form-heading">输入工资信息</h1>

        <div className="form-fields">
          <div className="primary-fields">
            <NumericField
              id="monthly-gross"
              label="税前月薪"
              value={values.monthlyGross}
              unit="元/月"
              onChange={(value) => update("monthlyGross", value)}
            />
            <div className="field-group housing-fund-field">
              <label htmlFor="housing-fund-rate">
                公积金
                <span className="field-hint">
                  {housingFundEstimate.supplementaryRate > 0 ||
                  employerHousingFundEstimate.supplementaryRate > 0
                    ? "含补充公积金 · 双方比例"
                    : "个人金额 · 双方比例"}
                </span>
              </label>
              <div
                className="housing-fund-auto-control"
                title={`${housingFundPolicy.city}公积金基数 ${compactMoney.format(housingFundEstimate.contributionBase)} 元，范围 ${compactMoney.format(housingFundPolicy.baseMin)}–${compactMoney.format(housingFundPolicy.baseMax)} 元${
                  housingFundEstimate.supplementaryRate > 0
                    ? `；个人普通 ${percent(housingFundEstimate.ordinaryRate)} + 补充 ${percent(housingFundEstimate.supplementaryRate)}`
                    : ""
                }`}
              >
                <output aria-label="个人公积金自动计算金额">
                  {compactMoney.format(housingFundEstimate.personalAmount)}
                </output>
                <select
                  id="housing-fund-rate"
                  aria-label="个人公积金个人缴存比例"
                  value={housingFundRate}
                  onChange={(event) => onHousingFundRateChange(Number(event.target.value))}
                >
                  {getHousingFundRateOptions(housingFundPolicy).map((rate) => (
                    <option key={rate} value={rate}>
                      个{Math.round(rate * 100)}%
                    </option>
                  ))}
                </select>
                <select
                  aria-label="公司公积金缴存比例"
                  value={employerHousingFundRate}
                  onChange={(event) =>
                    onEmployerHousingFundRateChange(Number(event.target.value))
                  }
                >
                  {getHousingFundRateOptions(housingFundPolicy).map((rate) => (
                    <option key={rate} value={rate}>
                      企{Math.round(rate * 100)}%
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <section className="social-control" aria-labelledby="social-control-label">
            <div className="social-control-heading">
              <span id="social-control-label">五险一金</span>
              <span>按城市规则自动估算</span>
            </div>

            <div className="auto-social-fields">
              <div className="field-group">
                <label htmlFor="social-city">
                  工作城市
                  <span className="field-hint">已收录 20 城</span>
                </label>
                <select
                  id="social-city"
                  className="select-control"
                  value={policy.id}
                  onChange={(event) => onPolicyChange(event.target.value)}
                >
                  {SOCIAL_SECURITY_POLICIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.city} · {item.province}
                    </option>
                  ))}
                </select>
              </div>

              <NumericField
                id="contribution-wage"
                label="上年度月均工资"
                hint="两项共用"
                value={contributionWage}
                unit="元/月"
                onChange={onContributionWageChange}
              />
            </div>
          </section>

          <div className="compact-field-grid compensation-field-grid">
            <NumericField
              id="special-deduction"
              label="专项附加扣除"
              value={values.monthlySpecialDeduction}
              unit="元/月"
              onChange={(value) => update("monthlySpecialDeduction", value)}
            />

            <NumericField
              id="extra-incentive"
              label="额外激励"
              hint="末月发放"
              value={values.extraIncentive}
              unit="元"
              onChange={(value) => update("extraIncentive", value)}
            />

            <div className="field-group period-bonus-field compensation-period-field">
              <div className="compound-field-label">
                <span>计薪 / 年终奖</span>
                <select
                  className="bonus-tax-select"
                  aria-label="年终奖计税方式"
                  title="全年一次性奖金政策执行至 2027 年 12 月 31 日"
                  value={values.bonusTaxMode}
                  onChange={(event) =>
                    update("bonusTaxMode", event.target.value as SalaryInput["bonusTaxMode"])
                  }
                >
                  <option value="separate">单独计税</option>
                  <option value="combined">并入综合所得</option>
                </select>
              </div>
              <div
                className="dual-numeric-control"
                title={`年终奖约 ¥${compactMoney.format(
                  values.monthlyGross * values.yearEndBonusMonths,
                )}`}
              >
                <div>
                  <input
                    id="months"
                    aria-label="计薪月份"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="12"
                    step="1"
                    value={values.months}
                    onChange={(event) => update("months", Number(event.target.value))}
                  />
                  <span aria-hidden="true">薪月</span>
                </div>
                <div>
                  <input
                    id="year-end-bonus-months"
                    aria-label="年终奖月数"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={values.yearEndBonusMonths}
                    onChange={(event) =>
                      update("yearEndBonusMonths", Number(event.target.value))
                    }
                  />
                  <span aria-hidden="true">奖月</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-message" aria-live="polite">
          {error ? (
            <p id="form-error" className="error-message" role="alert">
              <InfoIcon />
              {error}
            </p>
          ) : null}
        </div>

        <div className="form-actions">
          <button className="reset-button" type="button" onClick={onReset}>
            重置
          </button>
        </div>
      </form>
    </aside>
  );
}
