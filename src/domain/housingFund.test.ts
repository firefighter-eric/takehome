import { describe, expect, it } from "vitest";
import {
  estimateHousingFund,
  getHousingFundPolicy,
  getHousingFundRateOptions,
  HOUSING_FUND_POLICIES,
} from "./housingFund";

describe("housing fund estimation", () => {
  it("contains matching policies for all 20 supported cities", () => {
    expect(HOUSING_FUND_POLICIES).toHaveLength(20);
    expect(new Set(HOUSING_FUND_POLICIES.map((policy) => policy.id)).size).toBe(20);
  });

  it("calculates the personal contribution from wage and selected rate", () => {
    const estimate = estimateHousingFund(getHousingFundPolicy("beijing"), 35_000, 0.07);

    expect(estimate.contributionBase).toBe(35_000);
    expect(estimate.rate).toBe(0.07);
    expect(estimate.personalAmount).toBe(2_450);
  });

  it("applies the local ceiling and rounds the monthly amount to yuan", () => {
    const estimate = estimateHousingFund(getHousingFundPolicy("beijing"), 80_000, 0.12);

    expect(estimate.contributionBase).toBe(35_811);
    expect(estimate.capStatus).toBe("ceiling");
    expect(estimate.personalAmount).toBe(4_297);
  });

  it("clamps rates to the local range and exposes valid choices", () => {
    const shanghai = getHousingFundPolicy("shanghai");
    const estimate = estimateHousingFund(shanghai, 20_000, 0.12);

    expect(getHousingFundRateOptions(shanghai)).toEqual([0.05, 0.06, 0.07]);
    expect(estimate.rate).toBe(0.07);
    expect(estimate.personalAmount).toBe(1_400);
  });
});
