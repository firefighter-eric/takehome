import { Fragment, useState } from "react";
import type { SalaryResult } from "../domain/salary";
import { ChevronIcon } from "./Icons";
import {
  ContributionDetails,
  type ContributionDetailsProps,
} from "./ContributionDetails";

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
  contributionDetails: ContributionDetailsProps;
}

const COLLAPSED_VISIBLE_MONTHS = 4;

export function ResultsPanel({
  result,
  employerCost,
  contributionDetails,
}: ResultsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const visibleRows = expanded ? result.rows : result.rows.slice(0, COLLAPSED_VISIBLE_MONTHS);
  const hiddenCount = result.rows.length - visibleRows.length;
  const months = result.rows.length;
  const averageMonthlyGross = months ? result.totalGross / months : 0;
  const monthlyCompanyCost =
    averageMonthlyGross + employerCost.monthlySocialInsurance + employerCost.monthlyHousingFund;
  const totalCompanyCost = monthlyCompanyCost * months;

  const summary = [
    {
      label: "公司总付出成本",
      value: totalCompanyCost,
      tone: "company",
      meta: `月均 ¥${money.format(monthlyCompanyCost)}`,
    },
    {
      label: "税前收入",
      value: result.totalGross,
      tone: "default",
      meta: `月均 ¥${money.format(averageMonthlyGross)}`,
    },
    {
      label: "个人所得税",
      value: result.totalTax,
      tone: "tax",
      meta: "工资与奖金合计",
    },
    {
      label: "税后收入",
      value: result.totalNet,
      tone: "positive",
      meta: `月均 ¥${money.format(result.averageMonthlyNet)}`,
    },
  ];

  return (
    <section className="results-panel" aria-labelledby="results-heading">
      <h2 id="results-heading">计算结果</h2>

      <dl className="summary-strip" aria-live="polite">
        {summary.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd className={`summary-${item.tone}`}>¥{summaryMoney.format(item.value)}</dd>
            <small>{item.meta}</small>
          </div>
        ))}
      </dl>

      <ContributionDetails {...contributionDetails} />

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
                <th scope="col">个人社保</th>
                <th scope="col">个人公积金</th>
                <th scope="col">个税</th>
                <th scope="col">到手工资</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <Fragment key={row.month}>
                  <tr>
                    <th scope="row">{row.month}月</th>
                    <td>{money.format(row.gross)}</td>
                    <td>{money.format(row.socialInsurance)}</td>
                    <td>{money.format(row.housingFund)}</td>
                    <td className="tax-cell">{money.format(row.tax)}</td>
                    <td className="net-cell">{money.format(row.net)}</td>
                  </tr>
                  {row.bonus > 0 || row.extraIncentive > 0 ? (
                    <tr className="variable-pay-row">
                      <th scope="row">{row.month}月变动收入</th>
                      <td colSpan={5}>
                        <div className="variable-pay-details">
                          {row.bonus > 0 ? (
                            <span className="variable-pay-amount">
                              <span>年终奖</span>
                              <strong>{money.format(row.bonus)}</strong>
                            </span>
                          ) : null}
                          {row.extraIncentive > 0 ? (
                            <span className="variable-pay-amount">
                              <span>额外激励</span>
                              <strong>{money.format(row.extraIncentive)}</strong>
                            </span>
                          ) : null}
                          <span className="variable-pay-note">
                            已计入当月个税与到手工资
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {result.rows.length > COLLAPSED_VISIBLE_MONTHS ? (
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

      {result.bonusGross > 0 || result.extraIncentiveGross > 0 ? (
        <div className="variable-income-summary" aria-live="polite">
          {result.bonusGross > 0 ? (
            <>
              <span>
                年终奖 <strong>¥{summaryMoney.format(result.bonusGross)}</strong>
              </span>
              <span>
                计税方式{" "}
                <strong>
                  {result.bonusTaxMode === "separate" ? "单独计税" : "并入综合所得"}
                </strong>
              </span>
              <span>
                {result.bonusTaxMode === "separate" ? "适用税率" : "奖金增量税负"}{" "}
                <strong>
                  {(result.bonusTaxRate * 100).toFixed(2).replace(/\.00$/, "")}%
                </strong>
              </span>
              <span>
                奖金个税 / 税后{" "}
                <strong>
                  ¥{summaryMoney.format(result.bonusTax)} / ¥
                  {summaryMoney.format(result.bonusNet)}
                </strong>
              </span>
            </>
          ) : null}
          {result.extraIncentiveGross > 0 ? (
            <span>
              额外激励 <strong>¥{summaryMoney.format(result.extraIncentiveGross)}</strong>
              （{months}月发放，已并入综合所得）
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
