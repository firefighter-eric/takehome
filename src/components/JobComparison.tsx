import { useMemo } from "react";
import {
  calculateJobScenario,
  type CalculatedJobScenario,
  type JobScenario,
} from "../domain/jobScenario";
import { ComparisonJobForm } from "./ComparisonJobForm";

const wholeMoney = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
});

const money = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface JobComparisonProps {
  scenarioA: JobScenario;
  scenarioB: JobScenario;
  onScenarioAChange: (scenario: JobScenario) => void;
  onScenarioBChange: (scenario: JobScenario) => void;
  onResetA: () => void;
  onResetB: () => void;
  onUseCurrentForA: () => void;
}

interface ComparisonMetric {
  label: string;
  a: number;
  b: number;
  preference?: "higher" | "lower";
}

function differenceText(value: number): string {
  if (Math.abs(value) < 0.005) return "持平";
  return `${value > 0 ? "+" : "−"}¥${wholeMoney.format(Math.abs(value))}`;
}

function winnerClass(
  a: number,
  b: number,
  preference: ComparisonMetric["preference"],
  side: "a" | "b",
): string {
  if (!preference || a === b) return "";
  const aWins = preference === "higher" ? a > b : a < b;
  return (side === "a" && aWins) || (side === "b" && !aWins) ? "metric-winner" : "";
}

function buildMetrics(
  a: CalculatedJobScenario,
  b: CalculatedJobScenario,
): ComparisonMetric[] {
  if (!a.result || !b.result || a.totalCompanyCost === null || b.totalCompanyCost === null) {
    return [];
  }

  return [
    {
      label: "全年税后收入",
      a: a.result.totalNet,
      b: b.result.totalNet,
      preference: "higher",
    },
    {
      label: "月均税后收入",
      a: a.result.averageMonthlyNet,
      b: b.result.averageMonthlyNet,
      preference: "higher",
    },
    {
      label: "全年税前收入",
      a: a.result.totalGross,
      b: b.result.totalGross,
      preference: "higher",
    },
    {
      label: "个人所得税",
      a: a.result.totalTax,
      b: b.result.totalTax,
    },
    {
      label: "个人五险一金",
      a: a.result.totalSocialAndHousing,
      b: b.result.totalSocialAndHousing,
    },
    {
      label: "公司总付出成本",
      a: a.totalCompanyCost,
      b: b.totalCompanyCost,
    },
  ];
}

export function JobComparison({
  scenarioA,
  scenarioB,
  onScenarioAChange,
  onScenarioBChange,
  onResetA,
  onResetB,
  onUseCurrentForA,
}: JobComparisonProps) {
  const calculatedA = useMemo(() => calculateJobScenario(scenarioA), [scenarioA]);
  const calculatedB = useMemo(() => calculateJobScenario(scenarioB), [scenarioB]);
  const metrics = buildMetrics(calculatedA, calculatedB);
  const bothValid = Boolean(calculatedA.result && calculatedB.result);
  const netDifference =
    calculatedB.result && calculatedA.result
      ? calculatedB.result.totalNet - calculatedA.result.totalNet
      : 0;
  const higherNetName =
    netDifference > 0
      ? scenarioB.name || "工作 B"
      : netDifference < 0
        ? scenarioA.name || "工作 A"
        : "";
  const maxMonths = Math.max(
    calculatedA.result?.rows.length ?? 0,
    calculatedB.result?.rows.length ?? 0,
  );

  return (
    <main id="top" className="comparison-view">
      <div className="comparison-title-row">
        <div>
          <h1>对比两个工作</h1>
          <p>两套方案独立计算，统一比较全年税后收入与公司成本。</p>
        </div>
        <button type="button" className="copy-current-button" onClick={onUseCurrentForA}>
          用当前方案覆盖工作 A
        </button>
      </div>

      <div className="comparison-input-grid">
        <ComparisonJobForm
          index="A"
          scenario={scenarioA}
          policy={calculatedA.policy}
          housingFundPolicy={calculatedA.housingFundPolicy}
          error={calculatedA.error}
          onChange={onScenarioAChange}
          onReset={onResetA}
        />
        <ComparisonJobForm
          index="B"
          scenario={scenarioB}
          policy={calculatedB.policy}
          housingFundPolicy={calculatedB.housingFundPolicy}
          error={calculatedB.error}
          onChange={onScenarioBChange}
          onReset={onResetB}
        />
      </div>

      <section className="comparison-results" aria-labelledby="comparison-results-heading">
        <div className="comparison-result-heading">
          <div>
            <h2 id="comparison-results-heading">对比结果</h2>
            <p>差额均按“工作 B − 工作 A”计算。</p>
          </div>
          {bothValid ? (
            <div className={`comparison-verdict ${netDifference === 0 ? "is-tie" : ""}`}>
              <span>
                {netDifference === 0
                  ? "全年税后收入持平"
                  : `${higherNetName}：税后收入更高`}
              </span>
              <strong>{differenceText(Math.abs(netDifference))}</strong>
              <small>
                {netDifference === 0
                  ? "修改任一工作条件即可开始比较"
                  : `全年相差 ¥${wholeMoney.format(Math.abs(netDifference))}`}
              </small>
            </div>
          ) : (
            <div className="comparison-verdict is-invalid">
              <span>等待有效输入</span>
              <small>请先修正两侧表单中的提示</small>
            </div>
          )}
        </div>

        {metrics.length ? (
          <div
            className="comparison-metric-frame"
            tabIndex={0}
            aria-label="两个工作的核心指标对比，可横向滚动"
          >
            <table className="comparison-metric-table">
              <thead>
                <tr>
                  <th scope="col">核心指标</th>
                  <th scope="col">{scenarioA.name || "工作 A"}</th>
                  <th scope="col">{scenarioB.name || "工作 B"}</th>
                  <th scope="col">差额</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.label}>
                    <th scope="row">{metric.label}</th>
                    <td className={winnerClass(metric.a, metric.b, metric.preference, "a")}>
                      ¥{wholeMoney.format(metric.a)}
                    </td>
                    <td className={winnerClass(metric.a, metric.b, metric.preference, "b")}>
                      ¥{wholeMoney.format(metric.b)}
                    </td>
                    <td className={metric.b - metric.a >= 0 ? "positive-difference" : ""}>
                      {differenceText(metric.b - metric.a)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {bothValid ? (
          <>
            <div className="comparison-monthly-heading">
              <h3>月度到手对比</h3>
              <span>包含末月年终奖与额外激励</span>
            </div>
            <div
              className="comparison-monthly-frame"
              tabIndex={0}
              aria-label="两个工作的月度到手工资对比，可横向滚动"
            >
              <table>
                <thead>
                  <tr>
                    <th scope="col">月份</th>
                    <th scope="col">{scenarioA.name || "工作 A"}到手</th>
                    <th scope="col">{scenarioB.name || "工作 B"}到手</th>
                    <th scope="col">差额</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: maxMonths }, (_, index) => {
                    const rowA = calculatedA.result?.rows[index];
                    const rowB = calculatedB.result?.rows[index];
                    const rowDifference =
                      rowA && rowB ? rowB.net - rowA.net : rowB?.net ?? -(rowA?.net ?? 0);
                    return (
                      <tr key={index + 1}>
                        <th scope="row">{index + 1}月</th>
                        <td>{rowA ? money.format(rowA.net) : "—"}</td>
                        <td>{rowB ? money.format(rowB.net) : "—"}</td>
                        <td className={rowDifference >= 0 ? "positive-difference" : ""}>
                          {differenceText(rowDifference)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
