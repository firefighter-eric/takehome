import { useEffect, useRef } from "react";
import { HOUSING_FUND_POLICIES } from "../domain/housingFund";
import {
  BONUS_TAX_BRACKETS,
  MONTHLY_BASIC_DEDUCTION,
  TAX_BRACKETS,
} from "../domain/salary";
import {
  SOCIAL_SECURITY_INDEX_URL,
  SOCIAL_SECURITY_POLICIES,
} from "../domain/socialSecurity";
import { CloseIcon } from "./Icons";
import { PENSION_POLICY_URL } from "../domain/personalPension";

interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
}

const amount = new Intl.NumberFormat("zh-CN");

export function InfoDialog({ open, onClose }: InfoDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open === false) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusFirstControl = () => {
      const firstControl = dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstControl ?? dialogRef.current)?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || dialogRef.current === null) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const focusIsInside = dialogRef.current.contains(active);

      if (event.shiftKey && (active === first || focusIsInside === false)) {
        event.preventDefault();
        last.focus();
      } else if (event.shiftKey === false && (active === last || focusIsInside === false)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKeyDown);
    const focusFrame = window.requestAnimationFrame(focusFirstControl);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose, open]);

  if (open === false) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className="info-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-dialog-title"
        aria-describedby="info-dialog-description"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <h2 id="info-dialog-title">计算说明</h2>
            <p id="info-dialog-description">居民个人工资、薪金所得预扣预缴估算</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="关闭计算说明">
            <CloseIcon />
          </button>
        </header>

        <div className="dialog-content">
          <section>
            <h3>个人养老金测算</h3>
            <p>
              个人养老金模块按年度汇算口径单独测算今年一笔缴费：年度税前扣除限额为
              12,000 元，使用全年 60,000 元基本减除费用；「单个工作」中的工资汇总与月度明细仍为预扣口径。
              预计节税等于缴费前后的年度税额差，实际退税还取决于已预缴税额。
              可在个人养老金页面直接修改全年收入、年终奖和年度扣除，也可重新带入当前工作的数据。
            </p>
            <p>
              税惠折算年化按缴费、抵税和预计领取的现金流计算 IRR，产品收益默认为 0，
              领取时按账户本息的 3% 计税。次年退税按约 1 年后到账，当年抵税简化为立即享受。
              产品收益假设通过复利和现金流重新计算综合年化，不与税惠年化直接相加。
              年龄为可修改的示例，预计领取年龄不代表法定退休年龄，实际领取须满足政策条件。
            </p>
            <a className="source-link" href={PENSION_POLICY_URL} target="_blank" rel="noreferrer">
              查看个人养老金税收政策
            </a>
          </section>
          <section>
            <h3>计算口径</h3>
            <p>
              每月累计应税收入 = 累计税前工资与并入综合所得的额外激励 − 每月 ¥
              {amount.format(MONTHLY_BASIC_DEDUCTION)}
              基本减除费用 − 累计个人社保、公积金与专项附加扣除。
            </p>
            <p>
              本期个税 = 累计应税收入 × 预扣率 − 速算扣除数 − 此前月份已预扣税额。
              余额为负时按 0 计算。
            </p>
          </section>

          <section>
            <h3>居民个人工资薪金预扣率</h3>
            <div className="rate-table-scroll">
              <table className="rate-table">
                <thead>
                  <tr>
                    <th>累计应税收入上限</th>
                    <th>预扣率</th>
                    <th>速算扣除数</th>
                  </tr>
                </thead>
                <tbody>
                  {TAX_BRACKETS.map((bracket) => (
                    <tr key={bracket.upperBound}>
                      <td>
                        {Number.isFinite(bracket.upperBound)
                          ? `¥${amount.format(bracket.upperBound)}`
                          : "超过 ¥960,000"}
                      </td>
                      <td>{bracket.rate * 100}%</td>
                      <td>¥{amount.format(bracket.quickDeduction)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3>全年一次性奖金计税</h3>
            <p>
              单独计税时，以年终奖金额除以 12 个月后的数额确定税率和速算扣除数，
              奖金个税 = 年终奖 × 税率 − 速算扣除数；也可选择并入当年综合所得。
              当前政策执行至 2027 年 12 月 31 日，单独计税优惠在一个纳税年度内通常只允许使用一次。
              本计算器不会在奖金发放月重复扣一份社保、公积金，但奖金可能影响下一年度缴费基数。
            </p>
            <p>
              额外激励按一次性税前工资薪金在最后一个计薪月发放，并入综合所得，不使用年终奖单独计税优惠。
            </p>
            <div className="rate-table-scroll">
              <table className="rate-table">
                <thead>
                  <tr>
                    <th>奖金 ÷ 12 上限</th>
                    <th>税率</th>
                    <th>速算扣除数</th>
                  </tr>
                </thead>
                <tbody>
                  {BONUS_TAX_BRACKETS.map((bracket) => (
                    <tr key={bracket.upperBound}>
                      <td>
                        {Number.isFinite(bracket.upperBound)
                          ? `¥${amount.format(bracket.upperBound)}`
                          : "超过 ¥80,000"}
                      </td>
                      <td>{bracket.rate * 100}%</td>
                      <td>¥{amount.format(bracket.quickDeduction)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a
              className="source-link inline-source-link"
              href="https://fgk.chinatax.gov.cn/zcfgk/c102416/c5211524/content.html"
              target="_blank"
              rel="noreferrer"
            >
              查看财政部、税务总局 2023 年第 30 号公告
            </a>
          </section>

          <section>
            <h3>社保为什么不是直接按“社平工资 3 倍”计算？</h3>
            <p>
              在职职工通常以本人上年度月平均工资作为申报缴费工资。只有该工资超过当地上限时，
              才按上限封顶；低于下限时按下限保底。常见的 300% 和 60% 是上下限规则，
              不是所有人的默认缴费基数。新入职人员通常按起薪当月工资申报。
            </p>
          </section>

          <section>
            <h3>已收录 20 城个人 / 公司社保参考表</h3>
            <p>
              目前采用公开的 2025 政策周期数据。公司工伤费率随行业类别和浮动档位变化，
              成本计算统一采用表中最低档；实际账单需以当地经办机构与单位申报为准。
            </p>
            <div className="rate-table-scroll social-policy-table-scroll">
              <table className="rate-table social-policy-table">
                <thead>
                  <tr>
                    <th>城市</th>
                    <th>代表基数范围</th>
                    <th>养老 个 / 企</th>
                    <th>医疗生育 个 / 企</th>
                    <th>失业 个 / 企</th>
                    <th>工伤 个 / 企</th>
                  </tr>
                </thead>
                <tbody>
                  {SOCIAL_SECURITY_POLICIES.map((policy) => (
                    <tr key={policy.id}>
                      <td>
                        <a href={policy.sourceUrl} target="_blank" rel="noreferrer">
                          {policy.city}
                        </a>
                      </td>
                      <td>
                        ¥{amount.format(policy.baseMin)}–¥{amount.format(policy.baseMax)}（
                        {policy.baseLabel}）
                      </td>
                      <td>
                        {policy.rates.pension * 100}% / {policy.employerRates.pension * 100}%
                      </td>
                      <td>
                        {policy.rates.medical * 100}%
                        {policy.fixedMedical ? ` + ¥${policy.fixedMedical}` : ""}
                        {" / "}
                        {Number((policy.employerRates.medicalAndMaternity * 100).toFixed(2))}%
                      </td>
                      <td>
                        {policy.rates.unemployment * 100}% /{" "}
                        {policy.employerRates.unemployment * 100}%
                      </td>
                      <td>
                        0% / {policy.employerRates.injuryMin * 100}%–
                        {policy.employerRates.injuryMax * 100}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <a
              className="source-link inline-source-link"
              href={SOCIAL_SECURITY_INDEX_URL}
              target="_blank"
              rel="noreferrer"
            >
              查看 20 城来源快照与核验日期
            </a>
          </section>

          <section>
            <h3>公积金自动估算口径</h3>
            <p>
              个人、公司月缴额分别等于缴存基数乘以各自缴存比例。缴存基数通常采用本人上年度
              月平均工资，再按当地上下限核定。个人与公司比例默认同步，修改个人比例会同步调整公司；
              取消「同步比例」后可分别设置。
            </p>
            <div className="rate-table-scroll social-policy-table-scroll">
              <table className="rate-table housing-policy-table">
                <thead>
                  <tr>
                    <th>城市</th>
                    <th>公积金基数范围</th>
                    <th>个人 / 公司比例</th>
                    <th>数据周期</th>
                  </tr>
                </thead>
                <tbody>
                  {HOUSING_FUND_POLICIES.map((policy) => (
                    <tr key={policy.id}>
                      <td>
                        <a href={policy.sourceUrl} target="_blank" rel="noreferrer">
                          {policy.city}
                        </a>
                      </td>
                      <td>
                        ¥{amount.format(policy.baseMin)}–¥{amount.format(policy.baseMax)}
                      </td>
                      <td>
                        {policy.supplementaryRateMax
                          ? `普通各 ${Math.round(policy.rateMin * 100)}%–${Math.round(policy.rateMax * 100)}% + 补充各 1%–${Math.round(policy.supplementaryRateMax * 100)}%`
                          : `均为 ${Math.round(policy.rateMin * 100)}%–${Math.round(policy.rateMax * 100)}%`}
                      </td>
                      <td>{policy.effectiveLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="notice-box">
            公司总成本 = 税前工资、年终奖与额外激励 + 公司社保 + 公司公积金，不含招聘、福利、残保金等其他用工成本。
            自动社保采用单一代表性基数做综合估算；公积金比例需要按所在单位实际比例选择。
            部分城市不同险种基数并不完全一致，补充医疗、户籍或参保档次也可能改变实际金额。
            实际缴费请以工资条和主管部门最终核定结果为准。
            计算结果仅供预算参考，不替代社保、税务申报或专业意见。
          </aside>

          <a
            className="source-link"
            href="https://fgk.chinatax.gov.cn/zcfgk/c100012/c5194838/content.html"
            target="_blank"
            rel="noreferrer"
          >
            查看国家税务总局政策依据
          </a>
        </div>
      </section>
    </div>
  );
}
