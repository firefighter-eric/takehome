import type { HousingFundEstimate, HousingFundPolicy } from "../domain/housingFund";
import {
  type EmployerSocialSecurityEstimate,
  type SocialSecurityEstimate,
  type SocialSecurityPolicy,
} from "../domain/socialSecurity";

const money = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactMoney = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 0,
});

function percent(value: number): string {
  return `${Number((value * 100).toFixed(2))}%`;
}

function capStatusText(estimate: { capStatus: "floor" | "within" | "ceiling" }): string {
  if (estimate.capStatus === "floor") return "已按下限";
  if (estimate.capStatus === "ceiling") return "已按上限";
  return "按实际工资";
}

export interface ContributionDetailsProps {
  policy: SocialSecurityPolicy;
  socialEstimate: SocialSecurityEstimate;
  employerSocialEstimate: EmployerSocialSecurityEstimate;
  housingFundPolicy: HousingFundPolicy;
  housingFundEstimate: HousingFundEstimate;
  employerHousingFundEstimate: HousingFundEstimate;
  housingFundRate: number;
  employerHousingFundRate: number;
}

export function ContributionDetails({
  policy,
  socialEstimate,
  employerSocialEstimate,
}: ContributionDetailsProps) {
  const personalRateTotal =
    policy.rates.pension + policy.rates.medical + policy.rates.unemployment;

  const rows = [
    {
      name: "养老",
      personalRate: percent(policy.rates.pension),
      personalAmount: socialEstimate.pension,
      employerRate: percent(policy.employerRates.pension),
      employerAmount: employerSocialEstimate.pension,
    },
    {
      name: "医疗 / 生育",
      personalRate: `${percent(policy.rates.medical)}${
        policy.fixedMedical ? ` + ¥${policy.fixedMedical}` : ""
      }`,
      personalAmount: socialEstimate.medical,
      employerRate: percent(policy.employerRates.medicalAndMaternity),
      employerAmount: employerSocialEstimate.medicalAndMaternity,
    },
    {
      name: "失业",
      personalRate: percent(policy.rates.unemployment),
      personalAmount: socialEstimate.unemployment,
      employerRate: percent(policy.employerRates.unemployment),
      employerAmount: employerSocialEstimate.unemployment,
    },
    {
      name: "工伤",
      personalRate: "0%",
      personalAmount: 0,
      employerRate: `${percent(policy.employerRates.injuryMin)}–${percent(
        policy.employerRates.injuryMax,
      )}`,
      employerAmount: employerSocialEstimate.injury,
    },
  ];

  return (
    <section
      className="contribution-details"
      aria-labelledby="contribution-details-heading"
      aria-live="polite"
    >
      <div className="contribution-heading">
        <div>
          <h3 id="contribution-details-heading">社保缴费明细</h3>
          <p>
            {policy.city} · {policy.baseLabel}基数 ¥
            {compactMoney.format(socialEstimate.contributionBase)} ·{" "}
            {capStatusText(socialEstimate)}
          </p>
        </div>
        <span>{policy.effectiveLabel}</span>
      </div>

      <div className="contribution-table-scroll" tabIndex={0} aria-label="社保缴费明细表">
        <table className="contribution-table">
          <thead>
            <tr>
              <th scope="col">险种</th>
              <th scope="col">个人比例</th>
              <th scope="col">个人月缴</th>
              <th scope="col">公司比例</th>
              <th scope="col">公司月缴</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td>{row.personalRate}</td>
                <td>¥{money.format(row.personalAmount)}</td>
                <td>{row.employerRate}</td>
                <td>¥{money.format(row.employerAmount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">合计</th>
              <td>
                {percent(personalRateTotal)}
                {policy.fixedMedical ? ` + ¥${policy.fixedMedical}` : ""}
              </td>
              <td>¥{money.format(socialEstimate.total)}</td>
              <td>{percent(employerSocialEstimate.rateMin)}（最低档）</td>
              <td>¥{money.format(employerSocialEstimate.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

    </section>
  );
}
