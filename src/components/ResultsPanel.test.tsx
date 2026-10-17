import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { calculateJobScenario, createDefaultJobScenario } from "../domain/jobScenario";
import { ResultsPanel } from "./ResultsPanel";

function renderResults(monthlyGross: number) {
  const scenario = createDefaultJobScenario("当前工作");
  scenario.salary.monthlyGross = monthlyGross;
  const calculated = calculateJobScenario(scenario);
  return renderToStaticMarkup(
    <ResultsPanel
      result={calculated.result}
      employerCost={{
        monthlySocialInsurance: calculated.employerSocialEstimate.total,
        monthlyHousingFund: calculated.employerHousingFundEstimate.personalAmount,
      }}
      contributionDetails={{
        ...calculated,
        housingFundRate: calculated.housingFundEstimate.rate,
        employerHousingFundRate: calculated.employerHousingFundEstimate.rate,
      }}
    />,
  );
}

describe("ResultsPanel validation", () => {
  it("shows results and monthly details for valid income", () => {
    const html = renderResults(75_000);
    expect(html).toContain("公司总付出成本");
    expect(html).toContain("1,125,000");
    expect(html).toContain("月度工资明细");
  });

  it("hides totals and monthly details when deductions exceed the salary", () => {
    const html = renderResults(100);
    expect(html).toContain('role="status"');
    expect(html).toContain("请先修正工资信息");
    expect(html).not.toContain("公司总付出成本");
    expect(html).not.toContain("月度工资明细");
    expect(html).not.toContain("<table");
  });
});
