import { useState } from "react";
import type { SalaryResult } from "../domain/salary";
import { ChevronIcon } from "./Icons";

const money = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const summaryMoney = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
});

interface ResultsPanelProps {
  result: SalaryResult;
  employerCost: {
    monthlySocialInsurance: number;
    monthlyHousingFund: number;
  };
}

const DEFAULT_VISIBLE_MONTHS = 4;

export function ResultsPanel({ result, employerCost }: ResultsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? result.rows : result.rows.slice(0, DEFAULT_VISIBLE_MONTHS);
  const hiddenCount = result.rows.length - visibleRows.length;
  const months = result.rows.length;
  const averageMonthlyGross = months ? result.totalGross / months : 0;
  const monthlyCompanyCost =
    averageMonthlyGross + employerCost.monthlySocialInsurance + employerCost.monthlyHousingFund;
  const totalCompanyCost = monthlyCompanyCost * months;

  const summary = [
    { label: "公司总付出成本", value: totalCompanyCost, tone: "company" },
    { label: "税前收入", value: result.totalGross, tone: "default" },
    { label: "个人所得税", value: result.totalTax, tone: "tax" },
    { label: "税后收入", value: result.totalNet, tone: "positive" },
  ];

  return (
    <section className="results-panel" aria-labelledby="results-heading">
      <h2 id="results-heading">计算结果</h2>

      <div className="income-overview" aria-live="polite">
        <article className="company-cost-card">
          <span>公司月均总成本</span>
          <strong>¥{money.format(monthlyCompanyCost)}</strong>
          <small>
            税前 ¥{summaryMoney.format(averageMonthlyGross)} + 公司社保 ¥
            {summaryMoney.format(employerCost.monthlySocialInsurance)} + 公积金 ¥
            {summaryMoney.format(employerCost.monthlyHousingFund)}
          </small>
        </article>
        <article>
          <span>月均税前收入</span>
          <strong>¥{money.format(averageMonthlyGross)}</strong>
          <small>{result.bonusGross > 0 ? "工资与年终奖的期间月均" : "劳动合同约定的税前工资"}</small>
        </article>
        <article className="net-income-card">
          <span>月均税后收入</span>
          <strong>¥{money.format(result.averageMonthlyNet)}</strong>
          <small>扣除个人五险一金与个税后</small>
        </article>
      </div>

      <dl className="summary-strip">
        {summary.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd className={`summary-${item.tone}`}>¥{summaryMoney.format(item.value)}</dd>
          </div>
        ))}
      </dl>

      {result.bonusGross > 0 ? (
        <dl className="bonus-result-line">
          <div>
            <dt>年终奖</dt>
            <dd>¥{summaryMoney.format(result.bonusGross)}</dd>
          </div>
          <div>
            <dt>计税方式</dt>
            <dd>{result.bonusTaxMode === "separate" ? "单独计税" : "并入综合所得"}</dd>
          </div>
          <div>
            <dt>{result.bonusTaxMode === "separate" ? "适用税率" : "奖金增量税负"}</dt>
            <dd>{(result.bonusTaxRate * 100).toFixed(2).replace(/\.00$/, "")}%</dd>
          </div>
          <div>
            <dt>奖金个税 / 税后</dt>
            <dd>
              <span>¥{summaryMoney.format(result.bonusTax)}</span> / ¥
              {summaryMoney.format(result.bonusNet)}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="details-heading">
        <h3>月度明细</h3>
      </div>

      <div className="table-frame">
        <div className="table-scroll" tabIndex={0} aria-label="月度工资明细，可横向滚动">
          <table>
            <thead>
              <tr>
                <th scope="col">月份</th>
                <th scope="col">税前工资</th>
                <th scope="col">年终奖</th>
                <th scope="col">个人社保</th>
                <th scope="col">个人公积金</th>
                <th scope="col">个税</th>
                <th scope="col">到手工资</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.month}>
                  <th scope="row">{row.month}月</th>
                  <td>{money.format(row.gross)}</td>
                  <td>{row.bonus ? money.format(row.bonus) : "—"}</td>
                  <td>{money.format(row.socialInsurance)}</td>
                  <td>{money.format(row.housingFund)}</td>
                  <td className="tax-cell">{money.format(row.tax)}</td>
                  <td className="net-cell">{money.format(row.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result.rows.length > DEFAULT_VISIBLE_MONTHS ? (
          <button
            type="button"
            className="expand-button"
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
          >
            <ChevronIcon className={expanded ? "chevron-up" : ""} />
            {expanded ? "收起月度明细" : `还有 ${hiddenCount} 个月数据未显示，点击展开`}
          </button>
        ) : null}
      </div>
    </section>
  );
}
