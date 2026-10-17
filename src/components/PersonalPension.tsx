import {
  calculatePersonalPensionFromAnnualIncome,
  DEFAULT_PENSION_INPUT,
  PENSION_POLICY_URL,
  validatePensionInput,
  validateAnnualPensionIncome,
  type AnnualPensionIncome,
  type PersonalPensionInput,
} from "../domain/personalPension";
import { NumericField } from "./NumericField";
import { NumberInput } from "./NumberInput";
import "./PersonalPension.css";

const money = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 });
const percentage = (rate: number | null) => rate === null ? "—" : `${(rate * 100).toFixed(2)}%`;

interface PersonalPensionProps {
  income: AnnualPensionIncome;
  input: PersonalPensionInput;
  onChange: (input: PersonalPensionInput) => void;
}

export function PersonalPension({ income, input, onChange }: PersonalPensionProps) {
  const update = <Key extends keyof PersonalPensionInput>(key: Key, value: PersonalPensionInput[Key]) =>
    onChange({ ...input, [key]: value });
  const incomeError = validateAnnualPensionIncome(income);
  const error = validatePensionInput({ ...input, expectedAnnualReturn: 0 });
  const productError = validatePensionInput({ ...DEFAULT_PENSION_INPUT, expectedAnnualReturn: input.expectedAnnualReturn });
  const result = incomeError || error ? null : calculatePersonalPensionFromAnnualIncome(income,
    productError ? { ...input, expectedAnnualReturn: 0 } : input);

  return (
    <section className="pension-panel" aria-labelledby="pension-heading">
      <div className="pension-heading">
        <div>
          <span className="pension-eyebrow">今年这笔，算到退休</span>
          <h2 id="pension-heading">个人养老金测算</h2>
        </div>
        <span className="pension-badge">年度汇算 · 单笔</span>
      </div>
      <p className="pension-intro">根据本页的年度收入与扣除，看看今年能省多少税，折算到领取时每年相当于多少收益。</p>

      <div className="pension-inputs">
        <div className="field-group">
          <label htmlFor="pension-current-age">当前年龄</label>
          <div className="numeric-control">
            <NumberInput id="pension-current-age" inputMode="numeric" min="18" max="100" step="1"
              value={input.currentAge} onValueChange={(value) => update("currentAge", value)} />
            <span className="field-unit" aria-hidden="true">岁</span>
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="pension-retirement-age">预计退休／领取年龄</label>
          <div className="numeric-control">
            <NumberInput id="pension-retirement-age" inputMode="numeric" min={input.currentAge + 1} max="100" step="1"
              value={input.retirementAge} onValueChange={(value) => update("retirementAge", value)} />
            <span className="field-unit" aria-hidden="true">岁</span>
          </div>
        </div>
        <NumericField id="pension-contribution" label="今年缴费金额" value={input.contribution} unit="元/年"
          onChange={(value) => update("contribution", value)} />
        <div className="field-group">
          <label htmlFor="pension-refund-timing">享受抵税时间</label>
          <select id="pension-refund-timing" className="select-control" value={input.refundTiming}
            onChange={(event) => update("refundTiming", event.target.value as PersonalPensionInput["refundTiming"])}>
            <option value="next-year">次年退税（1年后）</option>
            <option value="immediate">当年抵税（立即）</option>
          </select>
        </div>
      </div>
      <div className="pension-shortcuts">
        <span>年龄和缴费为测算示例，可修改</span>
        <div>
          <button type="button" onClick={() => update("contribution", 0)}>不缴费</button>
          <button type="button" onClick={() => update("contribution", 12_000)}>缴满 12,000</button>
          <button type="button" onClick={() => onChange({ ...DEFAULT_PENSION_INPUT })}>重置测算</button>
        </div>
      </div>

      {error ? <p className="pension-error" role="alert">{error}</p> : null}
      {incomeError ? <p className="pension-note">请修正上方年度收入信息，以更新养老金测算。</p> : null}
      {result ? (
        <>
          <dl className="pension-metrics" aria-live="polite" aria-atomic="true">
            <div>
              <dt>本年预计节税</dt>
              <dd data-testid="pension-tax-saving">¥{money.format(result.taxSaving)}</dd>
              <small>缴费前后年度个税差额</small>
            </div>
            <div>
              <dt>退税后实际净支出</dt>
              <dd>¥{money.format(result.netContribution)}</dd>
              <small>缴费 − 预计节税</small>
            </div>
            <div className="pension-yield">
              <dt>税收优惠折算年化</dt>
              <dd data-testid="pension-tax-yield">{percentage(result.taxOnlyAnnualizedReturn)}</dd>
              <small>持有 {result.years} 年 · 不含产品收益</small>
            </div>
          </dl>

          {input.contribution > 0 ? (
            <div className="pension-cashflow" aria-label="仅税收优惠的现金流">
              <div><span>现在缴费</span><strong>−¥{money.format(input.contribution)}</strong></div>
              <div><span>{input.refundTiming === "next-year" ? "约 1 年后退税" : "当年抵税（按立即）"}</span><strong>＋¥{money.format(result.taxSaving)}</strong></div>
              <div><span>{input.retirementAge} 岁税后领取</span><strong>＋¥{money.format(result.taxOnlyWithdrawal)}</strong></div>
            </div>
          ) : <p className="pension-note">输入缴费金额后，可查看这笔资金的税惠折算年化。</p>}

          {input.contribution > 0 && result.taxOnlyAnnualizedReturn === null ? (
            <p className="pension-note">抵税后净投入为零，无法折算有限的年化收益率。</p>
          ) : null}

          {result.taxOnlyAnnualizedReturn !== null && result.taxOnlyAnnualizedReturn <= 0 ? (
            <p className="pension-note pension-caution">当前节税额未超过领取税款；不计产品收益时，税惠折算年化{result.taxOnlyAnnualizedReturn < 0 ? "为负" : "为零"}。</p>
          ) : null}

          <details className="pension-details">
            <summary>加入产品收益假设</summary>
            <div className="pension-investment">
              <NumericField id="pension-product-return" label="产品预期年化收益率"
                value={Number((input.expectedAnnualReturn * 100).toFixed(2))} unit="%"
                onChange={(value) => update("expectedAnnualReturn", value / 100)} />
              {productError ? <p className="pension-error" role="alert">{productError}</p> : <dl aria-live="polite">
                <div><dt>综合年化</dt><dd data-testid="pension-combined-yield">{percentage(result.combinedAnnualizedReturn)}</dd></div>
                <div><dt>税惠增加</dt><dd>{result.annualizedUplift === null ? "—" : `${result.annualizedUplift >= 0 ? "+" : ""}${(result.annualizedUplift * 100).toFixed(2)} 个百分点`}</dd></div>
                <div><dt>预计税后领取</dt><dd>¥{money.format(result.netWithdrawal)}</dd></div>
              </dl>}
            </div>
            <p className="pension-note">按固定年化复利、退休时一次性领取测算，领取税为账户本息的 3%。退税不再投资；预期收益由你设定，不代表实际回报。</p>
          </details>

          <details className="pension-details">
            <summary>计算过程与政策依据</summary>
            <dl className="pension-calculation">
              <div><dt>缴费前年度个税</dt><dd>¥{money.format(result.annualTaxBefore)}</dd></div>
              <div><dt>缴费后年度个税</dt><dd>¥{money.format(result.annualTaxAfter)}</dd></div>
              <div><dt>汇算后可支配现金（已扣缴费）</dt><dd>¥{money.format(result.disposableCashAfter)}</dd></div>
            </dl>
            <p className="pension-note">仅测算今年一笔缴费，年度税前扣除限额 12,000 元。综合所得使用全年 60,000 元基本减除费用，个人五险一金与专项附加扣除按本页年度金额计算；未计入未填写的收入或扣除。单独计税的年终奖税额不受影响。</p>
            <p className="pension-note">年化按缴费、抵税和领取三笔现金流计算内部收益率（IRR），包含领取时 3% 税款。税惠年化将产品收益设为 0，综合年化另计产品收益，不能直接相加。</p>
            <p className="pension-note">预计节税不等于实际退税，实际退税还取决于已预缴税额；「单个工作」中的汇总及月度明细仍按工资预扣口径展示。领取年龄仅作测算假设，实际领取须满足政策条件；长期测算假设现行税收政策保持不变。</p>
            <a href={PENSION_POLICY_URL} target="_blank" rel="noreferrer">查看国家税务总局个人养老金政策</a>
            <a href="https://fgk.chinatax.gov.cn/zcfgk/c100011/c5238560/content.html" target="_blank" rel="noreferrer">查看综合所得汇算口径</a>
          </details>
        </>
      ) : null}
    </section>
  );
}
