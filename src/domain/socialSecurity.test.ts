import { describe, expect, it } from "vitest";
import {
  estimateEmployerSocialInsurance,
  estimateSocialInsurance,
  getSocialSecurityPolicy,
  SOCIAL_SECURITY_POLICIES,
} from "./socialSecurity";

describe("social insurance estimation", () => {
  it("contains a unique policy record for every supported city", () => {
    expect(SOCIAL_SECURITY_POLICIES).toHaveLength(20);
    expect(new Set(SOCIAL_SECURITY_POLICIES.map((policy) => policy.id)).size).toBe(20);
  });

  it("uses the published floor when contribution wage is below the range", () => {
    const estimate = estimateSocialInsurance(getSocialSecurityPolicy("hangzhou"), 3_000);

    expect(estimate.contributionBase).toBe(4_986);
    expect(estimate.capStatus).toBe("floor");
    expect(estimate.total).toBe(523.53);
  });

  it("uses the published ceiling when contribution wage is above the range", () => {
    const estimate = estimateSocialInsurance(getSocialSecurityPolicy("tianjin"), 50_000);

    expect(estimate.contributionBase).toBe(25_620);
    expect(estimate.capStatus).toBe("ceiling");
    expect(estimate.total).toBe(2_690.1);
  });

  it("includes Beijing's fixed medical insurance charge", () => {
    const estimate = estimateSocialInsurance(getSocialSecurityPolicy("beijing"), 10_000);

    expect(estimate.pension).toBe(800);
    expect(estimate.medical).toBe(203);
    expect(estimate.unemployment).toBe(50);
    expect(estimate.total).toBe(1_053);
  });

  it("calculates Beijing employer contributions with the minimum injury rate", () => {
    const estimate = estimateEmployerSocialInsurance(
      getSocialSecurityPolicy("beijing"),
      35_000,
    );

    expect(estimate.pension).toBe(5_600);
    expect(estimate.medicalAndMaternity).toBe(3_430);
    expect(estimate.unemployment).toBe(175);
    expect(estimate.injury).toBe(70);
    expect(estimate.total).toBe(9_275);
    expect(estimate.rateMin).toBeCloseTo(0.265);
    expect(estimate.rateMax).toBeCloseTo(0.282);
  });

  it("applies the same published contribution ceiling to employer estimates", () => {
    const estimate = estimateEmployerSocialInsurance(
      getSocialSecurityPolicy("beijing"),
      80_000,
    );

    expect(estimate.contributionBase).toBe(35_811);
    expect(estimate.capStatus).toBe("ceiling");
    expect(estimate.total).toBe(9_489.92);
  });

  it("uses Shanghai's latest published limits and current employer medical rate", () => {
    const policy = getSocialSecurityPolicy("shanghai");
    const personal = estimateSocialInsurance(policy, 75_000);
    const employer = estimateEmployerSocialInsurance(policy, 75_000);

    expect(policy.baseMin).toBe(7_460);
    expect(policy.baseMax).toBe(37_302);
    expect(policy.effectiveLabel).toContain("2026新限额待公布");
    expect(policy.employerRates.medicalAndMaternity).toBe(0.09);
    expect(personal.contributionBase).toBe(37_302);
    expect(personal.total).toBe(3_916.71);
    expect(employer.medicalAndMaternity).toBe(3_357.18);
    expect(employer.total).toBe(9_586.61);
  });
});
