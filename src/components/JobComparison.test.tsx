import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createDefaultJobScenario } from "../domain/jobScenario";
import { JobComparison } from "./JobComparison";

describe("JobComparison", () => {
  it("renders two independent forms and both comparison tables", () => {
    const scenarioA = createDefaultJobScenario("当前工作");
    const scenarioB = {
      ...createDefaultJobScenario("新工作"),
      salary: {
        ...createDefaultJobScenario("新工作").salary,
        monthlyGross: 90_000,
      },
    };
    const html = renderToStaticMarkup(
      <JobComparison
        scenarioA={scenarioA}
        scenarioB={scenarioB}
        onScenarioAChange={() => undefined}
        onScenarioBChange={() => undefined}
        onResetA={() => undefined}
        onResetB={() => undefined}
        onUseCurrentForA={() => undefined}
      />,
    );

    expect(html).toContain("对比两个工作");
    expect(html).toContain('id="compare-a-gross"');
    expect(html).toContain('id="compare-b-gross"');
    expect(html).toContain("全年税后收入");
    expect(html).toContain("公司总付出成本");
    expect(html).toContain("月度到手对比");
    expect(html).toContain("新工作：税后收入更高");
  });
});
