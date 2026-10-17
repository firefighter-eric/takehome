import {
  calculatePersonalPensionFromAnnualIncome,
  DEFAULT_PENSION_INPUT,
  validateAnnualPensionIncome,
  type AnnualPensionIncome,
} from "../domain/personalPension";
import { NumericField } from "./NumericField";

const money = new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 });
const SUMMARY_INPUT = { ...DEFAULT_PENSION_INPUT, contribution: 0 };

interface PensionIncomeEditorProps {
  income: AnnualPensionIncome;
  onChange: (income: AnnualPensionIncome) => void;
  canImport: boolean;
  onImport: () => void;
}

export function PensionIncomeEditor({ income, onChange, canImport, onImport }: PensionIncomeEditorProps) {
  const error = validateAnnualPensionIncome(income);
  const summary = error ? null : calculatePersonalPensionFromAnnualIncome(income, SUMMARY_INPUT);
  const update = <Key extends keyof AnnualPensionIncome>(key: Key, value: AnnualPensionIncome[Key]) =>
    onChange({ ...income, [key]: value });

  return (
    <section className="pension-income-editor" aria-labelledby="pension-income-heading">
      <div className="pension-income-heading">
        <div>
          <h2 id="pension-income-heading">年度收入与扣除</h2>
          <p>首次从「单个工作」带入，可在这里直接修改并独立测算。</p>
        </div>
        <button type="button" onClick={onImport} disabled={!canImport}>重新带入当前工作</button>
      </div>
      <div className="pension-income-fields">
        <NumericField id="pension-annual-gross-input" label="全年税前收入" hint="含年终奖"
          value={income.annualGross} unit="元/年" onChange={(value) => update("annualGross", value)} />
        <NumericField id="pension-annual-bonus" label="其中：年终奖" value={income.annualBonus}
          unit="元/年" onChange={(value) => update("annualBonus", value)} />
        <div className="field-group">
          <label htmlFor="pension-income-bonus-mode">年终奖计税方式</label>
          <select id="pension-income-bonus-mode" className="select-control" value={income.bonusTaxMode}
            onChange={(event) => update("bonusTaxMode", event.target.value as AnnualPensionIncome["bonusTaxMode"])}>
            <option value="separate">单独计税</option>
            <option value="combined">并入综合所得</option>
          </select>
        </div>
        <NumericField id="pension-annual-social-housing" label="个人五险一金" hint="全年"
          value={income.annualSocialAndHousing} unit="元/年" onChange={(value) => update("annualSocialAndHousing", value)} />
        <NumericField id="pension-annual-special-deduction" label="专项附加扣除" hint="全年"
          value={income.annualSpecialDeduction} unit="元/年" onChange={(value) => update("annualSpecialDeduction", value)} />
        <dl className="pension-taxable-summary" aria-live="polite">
          <dt>综合所得应纳税所得额<span>养老金扣除前</span></dt>
          <dd data-testid="pension-annual-taxable">{summary ? `¥${money.format(summary.taxableIncomeBefore)}` : "—"}</dd>
        </dl>
      </div>
      <p className="pension-income-note">全年税前收入包含工资、年终奖和额外激励。基本减除费用 ¥60,000 已自动扣除，无需重复填写；单独计税的年终奖不计入综合所得应纳税所得额。</p>
      {!canImport ? <p className="pension-income-note">当前工作信息有误，暂无法带入；可以直接填写本页的年度收入。</p> : null}
      {error ? <p className="pension-error" role="alert">{error}</p> : null}
    </section>
  );
}
