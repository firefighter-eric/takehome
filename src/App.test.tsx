import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App salary form", () => {
  it("renders automatic results without a submit button", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).not.toContain("计算到手工资");
    expect(html).not.toContain('type="submit"');
    expect(html).not.toContain("手动填写");
    expect(html).not.toContain("五险一金计算方式");
    expect(html).toContain("按城市规则自动估算");
    expect(html).toContain('aria-label="个人公积金自动计算金额"');
    expect(html).toContain("重置");
    expect(html).toContain("计算结果");
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("收起月度明细");
    expect(html).not.toContain("个月数据未显示");
    expect(html).not.toContain('scope="col">年终奖');
    expect(html).not.toContain('scope="col">额外激励');
    expect(html).toContain('scope="row">12月变动收入');
    expect(html).toContain("<span>年终奖</span><strong>225,000.00</strong>");
  });
});
