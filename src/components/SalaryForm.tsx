import type { FormEvent } from "react";
import {
  getHousingFundRateOptions,
  type HousingFundEstimate,
  type HousingFundPolicy,
} from "../domain/housingFund";
import type { SalaryInput } from "../domain/salary";
import {
  SOCIAL_SECURITY_INDEX_URL,
  SOCIAL_SECURITY_POLICIES,
  type EmployerSocialSecurityEstimate,
  type SocialInsuranceMode,
  type SocialSecurityEstimate,
  type SocialSecurityPolicy,
} from "../domain/socialSecurity";
import { InfoIcon } from "./Icons";
import { NumericField } from "./NumericField";

const money = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactMoney = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
});

function capStatusText(estimate: { capStatus: "floor" | "within" | "ceiling" }): string {
  if (estimate.capStatus === "floor") return "已按下限";
  if (estimate.capStatus === "ceiling") return "已按上限";
  return "按实际工资";
}

function percent(value: number): string {
  return `${Number((value * 100).toFixed(2))}%`;
}

interface SalaryFormProps {
  values: SalaryInput;
  error: string | null;
  onChange: (values: SalaryInput) => void;
  onSubmit: () => void;
  onReset: () => void;
  socialMode: SocialInsuranceMode;
  policy: SocialSecurityPolicy;
  housingFundPolicy: HousingFundPolicy;
  contributionWage: number;
  socialEstimate: SocialSecurityEstimate;
  employerSocialEstimate: EmployerSocialSecurityEstimate;
  housingFundEstimate: HousingFundEstimate;
  employerHousingFundEstimate: HousingFundEstimate;
  housingFundRate: number;
  employerHousingFundRate: number;
  onSocialModeChange: (mode: SocialInsuranceMode) => void;
  onPolicyChange: (policyId: string) => void;
  onContributionWageChange: (value: number) => void;
  onHousingFundRateChange: (rate: number) => void;
  onEmployerHousingFundRateChange: (rate: number) => void;
}

export function SalaryForm({
  values,
  error,
  onChange,
  onSubmit,
  onReset,
  socialMode,
  policy,
  housingFundPolicy,
  contributionWage,
  socialEstimate,
  employerSocialEstimate,
  housingFundEstimate,
  employerHousingFundEstimate,
  housingFundRate,
  employerHousingFundRate,
  onSocialModeChange,
  onPolicyChange,
  onContributionWageChange,
  onHousingFundRateChange,
  onEmployerHousingFundRateChange,
}: SalaryFormProps) {
  const update = <Key extends keyof SalaryInput>(key: Key, value: SalaryInput[Key]) => {
    onChange({ ...values, [key]: value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <aside className="input-panel" aria-labelledby="salary-form-heading">
      <form onSubmit={handleSubmit} noValidate>
        <h1 id="salary-form-heading">输入工资信息</h1>

        <div className="form-fields">
          <div className="compact-field-grid">
            <NumericField
              id="monthly-gross"
              label="税前月薪"
              value={values.monthlyGross}
              unit="元/月"
              onChange={(value) => update("monthlyGross", value)}
            />
            {socialMode === "auto" ? (
              <div className="field-group housing-fund-field">
                <label htmlFor="housing-fund-rate">
                  公积金
                  <span className="field-hint">个人金额 · 双方比例</span>
                </label>
                <div
                  className="housing-fund-auto-control"
                  title={`${housingFundPolicy.city}公积金基数 ${compactMoney.format(housingFundEstimate.contributionBase)} 元，范围 ${compactMoney.format(housingFundPolicy.baseMin)}–${compactMoney.format(housingFundPolicy.baseMax)} 元`}
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
            ) : (
              <div className="manual-fund-stack">
                <NumericField
                  id="housing-fund"
                  label="个人公积金"
                  hint="按工资条"
                  value={values.monthlyHousingFund}
                  unit="元/月"
                  onChange={(value) => update("monthlyHousingFund", value)}
                />
                <label className="inline-company-rate">
                  公司公积金比例
                  <select
                    aria-label="公司公积金缴存比例"
                    value={employerHousingFundRate}
                    onChange={(event) =>
                      onEmployerHousingFundRateChange(Number(event.target.value))
                    }
                  >
                    {getHousingFundRateOptions(housingFundPolicy).map((rate) => (
                      <option key={rate} value={rate}>
                        {Math.round(rate * 100)}%
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>

          <section className="social-control" aria-labelledby="social-control-label">
            <div className="social-control-top">
              <div className="social-control-heading">
                <span id="social-control-label">五险一金</span>
                <span>社保 · 公积金</span>
              </div>

              <div className="mode-switch" role="group" aria-label="五险一金计算方式">
                <button
                  type="button"
                  className={socialMode === "auto" ? "is-active" : ""}
                  aria-pressed={socialMode === "auto"}
                  onClick={() => onSocialModeChange("auto")}
                >
                  自动估算
                </button>
                <button
                  type="button"
                  className={socialMode === "manual" ? "is-active" : ""}
                  aria-pressed={socialMode === "manual"}
                  onClick={() => onSocialModeChange("manual")}
                >
                  手动填写
                </button>
              </div>
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

                {socialMode === "manual" ? (
                  <div className="manual-social-field">
                    <NumericField
                      id="social-insurance"
                      label="个人社保月缴"
                      hint="按工资条填写最准确"
                      value={values.monthlySocialInsurance}
                      unit="元/月"
                      onChange={(value) => update("monthlySocialInsurance", value)}
                    />
                  </div>
                ) : null}

                <div className="social-estimate-card" aria-live="polite">
                  <div className="estimate-total">
                    <span>{socialMode === "auto" ? "个人社保月缴" : "个人社保（工资条）"}</span>
                    <strong>
                      ¥{money.format(
                        socialMode === "auto"
                          ? socialEstimate.total
                          : values.monthlySocialInsurance,
                      )}
                    </strong>
                    <small>公司社保约 ¥{money.format(employerSocialEstimate.total)}</small>
                  </div>
                  <dl className="estimate-breakdown">
                    <div>
                      <dt>
                        养老 个{percent(policy.rates.pension)} · 企
                        {percent(policy.employerRates.pension)}
                      </dt>
                      <dd>¥{money.format(socialEstimate.pension)}</dd>
                    </div>
                    <div>
                      <dt>
                        医疗/生育 个{percent(policy.rates.medical)} · 企
                        {percent(policy.employerRates.medicalAndMaternity)}
                        {policy.fixedMedical ? ` + ¥${policy.fixedMedical}` : ""}
                      </dt>
                      <dd>¥{money.format(socialEstimate.medical)}</dd>
                    </div>
                    <div>
                      <dt>
                        失业 个{percent(policy.rates.unemployment)} · 企
                        {percent(policy.employerRates.unemployment)}
                      </dt>
                      <dd>¥{money.format(socialEstimate.unemployment)}</dd>
                    </div>
                    <div>
                      <dt>
                        工伤 个0% · 企{percent(policy.employerRates.injuryMin)}–
                        {percent(policy.employerRates.injuryMax)}
                      </dt>
                      <dd>最低档 ¥{money.format(employerSocialEstimate.injury)}</dd>
                    </div>
                  </dl>
                  <p className="base-explanation">
                    {policy.baseLabel}基数 ¥{compactMoney.format(socialEstimate.contributionBase)} ·
                    范围 ¥{compactMoney.format(policy.baseMin)}–¥
                    {compactMoney.format(policy.baseMax)} · {capStatusText(socialEstimate)}
                  </p>
                  <div className="policy-meta">
                    <span>
                      公司社保按最低工伤档，合计约 {percent(employerSocialEstimate.rateMin)}
                    </span>
                  </div>
                  <details className="policy-disclosure">
                    <summary>查看估算口径</summary>
                    <div>
                      <p>
                        公司社保：养老 ¥{money.format(employerSocialEstimate.pension)}、
                        医疗/生育 ¥{money.format(employerSocialEstimate.medicalAndMaternity)}、
                        失业 ¥{money.format(employerSocialEstimate.unemployment)}、工伤 ¥
                        {money.format(employerSocialEstimate.injury)}。
                      </p>
                      <p>
                        工伤个人不缴，公司实际比例按行业与浮动档位确定；本计算采用最低档
                        {percent(policy.employerRates.injuryMin)}。
                      </p>
                      {policy.note ? <p>{policy.note}</p> : null}
                      <p>
                        各险种基数、补充医疗及身份口径可能不同，需要精确结果时请使用手动模式。
                      </p>
                      <p>
                        公积金：{housingFundPolicy.effectiveLabel}，个人
                        {Math.round(housingFundRate * 100)}%、公司
                        {Math.round(employerHousingFundRate * 100)}%；公司月缴约 ¥
                        {compactMoney.format(employerHousingFundEstimate.personalAmount)}；
                        基数 ¥{compactMoney.format(housingFundEstimate.contributionBase)}（范围 ¥
                        {compactMoney.format(housingFundPolicy.baseMin)}–¥
                        {compactMoney.format(housingFundPolicy.baseMax)}，
                        {capStatusText(housingFundEstimate)}）。
                      </p>
                      <p className="policy-links">
                        <a href={policy.sourceUrl} target="_blank" rel="noreferrer">
                          社保来源
                        </a>
                        <a href={housingFundPolicy.sourceUrl} target="_blank" rel="noreferrer">
                          公积金来源
                        </a>
                        <a href={SOCIAL_SECURITY_INDEX_URL} target="_blank" rel="noreferrer">
                          20城索引
                        </a>
                      </p>
                    </div>
                  </details>
                </div>
              </div>
          </section>

          <div className="compact-field-grid">
            <NumericField
              id="special-deduction"
              label="专项附加扣除"
              value={values.monthlySpecialDeduction}
              unit="元/月"
              onChange={(value) => update("monthlySpecialDeduction", value)}
            />

            <div className="field-group period-bonus-field">
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
          <button className="primary-button" type="submit">
            计算到手工资
          </button>
          <button className="reset-button" type="button" onClick={onReset}>
            重置
          </button>
        </div>
      </form>
    </aside>
  );
}
