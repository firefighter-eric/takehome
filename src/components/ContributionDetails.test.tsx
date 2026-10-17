import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { calculateJobScenario, createDefaultJobScenario } from "../domain/jobScenario";
import { ContributionDetails } from "./ContributionDetails";

function renderDetails() {
  const scenario = createDefaultJobScenario("当前工作");
  const calculated = calculateJobScenario(scenario);
  return renderToStaticMarkup(
    <ContributionDetails
      policy={calculated.policy}
      socialEstimate={calculated.socialEstimate}
      employerSocialEstimate={calculated.employerSocialEstimate}
      housingFundPolicy={calculated.housingFundPolicy}
      housingFundEstimate={calculated.housingFundEstimate}
      employerHousingFundEstimate={calculated.employerHousingFundEstimate}
      housingFundRate={calculated.housingFundEstimate.rate}
      employerHousingFundRate={calculated.employerHousingFundEstimate.rate}
    />,
  );
}

describe("ContributionDetails", () => {
  it("renders both social insurance and housing fund contributions", () => {
    const html = renderDetails();
    expect(html).toContain("五险一金缴费明细");
    expect(html).toContain("住房公积金");
    expect(html).toContain("个人五险一金合计");
    expect(html).toContain("公司五险一金合计");
    expect(html).toContain("补充公积金 5%");
  });

  it("renders policy caveats and source links", () => {
    const html = renderDetails();
    expect(html).toContain("2026社保年度新上下限待官方发布");
    expect(html).toContain("公司医疗保险按2026年3月起现行9%计入");
    expect(html).toContain("上海市人力资源和社会保障局");
    expect(html).toContain("上海市公积金管理中心");
    expect(html).toContain('target="_blank"');
  });
});
