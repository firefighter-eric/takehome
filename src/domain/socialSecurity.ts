export interface SocialSecurityRates {
  pension: number;
  medical: number;
  unemployment: number;
}

export interface EmployerSocialSecurityRates {
  pension: number;
  medicalAndMaternity: number;
  unemployment: number;
  injuryMin: number;
  injuryMax: number;
}

export interface SocialSecurityPolicy {
  id: string;
  city: string;
  province: string;
  baseMin: number;
  baseMax: number;
  baseLabel: "社保" | "医保" | "养老";
  effectiveLabel: string;
  rates: SocialSecurityRates;
  employerRates: EmployerSocialSecurityRates;
  fixedMedical: number;
  sourceName: string;
  sourceUrl: string;
  baseNotice?: string;
  note?: string;
}

export interface SocialSecurityEstimate {
  contributionWage: number;
  contributionBase: number;
  pension: number;
  medical: number;
  unemployment: number;
  total: number;
  capStatus: "floor" | "within" | "ceiling";
}

export interface EmployerSocialSecurityEstimate {
  contributionWage: number;
  contributionBase: number;
  pension: number;
  medicalAndMaternity: number;
  unemployment: number;
  injury: number;
  total: number;
  rateMin: number;
  rateMax: number;
  capStatus: "floor" | "within" | "ceiling";
}

export const SOCIAL_SECURITY_INDEX_URL = "https://shebaosucha.com/trust/source-list";

// 公开政策常按险种分别确定基数。这里采用公开索引中的代表性基数范围做工资预算估算，
// 个人承担的工伤、生育保险通常为 0，不计入个人扣款。
export const SOCIAL_SECURITY_POLICIES: SocialSecurityPolicy[] = [
  {
    id: "beijing",
    city: "北京",
    province: "北京市",
    baseMin: 7_162,
    baseMax: 35_811,
    baseLabel: "社保",
    effectiveLabel: "2025年7月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.098,
      unemployment: 0.005,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 3,
    sourceName: "北京市人力资源和社会保障局",
    sourceUrl: "https://rsj.beijing.gov.cn/xxgk/2024zcjd/202509/t20250918_4204887.html",
    note: "医疗个人缴费另加每月 3 元。",
  },
  {
    id: "shanghai",
    city: "上海",
    province: "上海市",
    baseMin: 7_460,
    baseMax: 37_302,
    baseLabel: "社保",
    effectiveLabel: "2025年7月起 · 2026新限额待公布",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.09,
      unemployment: 0.005,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "上海市人力资源和社会保障局",
    sourceUrl: "https://rsj.sh.gov.cn/tgsgg_17341/20250918/t0035_1435637.html",
    baseNotice:
      "2026社保年度新上下限待官方发布；当前暂按最近已公布的2025年度范围估算。",
    note: "公司医疗保险按2026年3月起现行9%计入，含生育保险8.5%和地方附加医疗0.5%。",
  },
  {
    id: "guangzhou",
    city: "广州",
    province: "广东省",
    baseMin: 5_510,
    baseMax: 27_549,
    baseLabel: "医保",
    effectiveLabel: "2025年7月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.002 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.0635,
      unemployment: 0.008,
      injuryMin: 0.002,
      injuryMax: 0.014,
    },
    fixedMedical: 0,
    sourceName: "广州市人力资源和社会保障局",
    sourceUrl: "https://rsj.gz.gov.cn/",
    note: "展示范围为医保代表口径，养老等险种可能采用不同下限。",
  },
  {
    id: "shenzhen",
    city: "深圳",
    province: "广东省",
    baseMin: 6_733,
    baseMax: 33_666,
    baseLabel: "医保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.002 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.055,
      unemployment: 0.008,
      injuryMin: 0.002,
      injuryMax: 0.014,
    },
    fixedMedical: 0,
    sourceName: "深圳市人力资源和社会保障局",
    sourceUrl: "https://hrss.sz.gov.cn/",
    note: "按职工医保一档估算；养老等险种可能采用不同基数范围。",
  },
  {
    id: "hangzhou",
    city: "杭州",
    province: "浙江省",
    baseMin: 4_986,
    baseMax: 25_299,
    baseLabel: "社保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.095,
      unemployment: 0.005,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "国家税务总局浙江省税务局",
    sourceUrl: "https://zhejiang.chinatax.gov.cn/art/2025/12/11/art_13314_645797.html",
  },
  {
    id: "chengdu",
    city: "成都",
    province: "四川省",
    baseMin: 4_588,
    baseMax: 22_938,
    baseLabel: "社保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.004 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.083,
      unemployment: 0.006,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "四川省人民政府",
    sourceUrl: "https://www.sc.gov.cn/",
  },
  {
    id: "nanjing",
    city: "南京",
    province: "江苏省",
    baseMin: 4_952,
    baseMax: 24_762,
    baseLabel: "社保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.08,
      unemployment: 0.005,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "江苏省人力资源和社会保障厅",
    sourceUrl: "https://jshrss.jiangsu.gov.cn/",
  },
  {
    id: "wuhan",
    city: "武汉",
    province: "湖北省",
    baseMin: 4_498,
    baseMax: 22_488,
    baseLabel: "社保",
    effectiveLabel: "2025年7月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.003 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.08,
      unemployment: 0.007,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "湖北省人力资源和社会保障厅",
    sourceUrl: "https://rst.hubei.gov.cn/",
  },
  {
    id: "suzhou",
    city: "苏州",
    province: "江苏省",
    baseMin: 4_952,
    baseMax: 24_762,
    baseLabel: "社保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.08,
      unemployment: 0.005,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "江苏省人力资源和社会保障厅",
    sourceUrl: "https://jshrss.jiangsu.gov.cn/",
  },
  {
    id: "tianjin",
    city: "天津",
    province: "天津市",
    baseMin: 5_124,
    baseMax: 25_620,
    baseLabel: "社保",
    effectiveLabel: "2025年10月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.105,
      unemployment: 0.005,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "国家税务总局天津市税务局",
    sourceUrl: "https://tianjin.chinatax.gov.cn/11200000000/0300/030005/20260122110612385.shtml",
  },
  {
    id: "chongqing",
    city: "重庆",
    province: "重庆市",
    baseMin: 4_404,
    baseMax: 22_017,
    baseLabel: "社保",
    effectiveLabel: "2025年7月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.085,
      unemployment: 0.005,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "重庆市人力资源和社会保障局",
    sourceUrl: "https://rlsbj.cq.gov.cn/",
  },
  {
    id: "xian",
    city: "西安",
    province: "陕西省",
    baseMin: 4_650,
    baseMax: 23_250,
    baseLabel: "医保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.003 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.08,
      unemployment: 0.007,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "陕西省人力资源和社会保障厅",
    sourceUrl: "https://rst.shaanxi.gov.cn/",
    note: "展示范围为医保代表口径，养老等险种可能采用不同基数范围。",
  },
  {
    id: "changsha",
    city: "长沙",
    province: "湖南省",
    baseMin: 4_072,
    baseMax: 20_361,
    baseLabel: "社保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.003 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.087,
      unemployment: 0.007,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "湖南省人民政府",
    sourceUrl: "https://www.hunan.gov.cn/",
  },
  {
    id: "zhengzhou",
    city: "郑州",
    province: "河南省",
    baseMin: 3_831,
    baseMax: 19_155,
    baseLabel: "社保",
    effectiveLabel: "2025年7月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.003 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.08,
      unemployment: 0.007,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "河南省人力资源和社会保障厅",
    sourceUrl: "https://hrss.henan.gov.cn/",
  },
  {
    id: "qingdao",
    city: "青岛",
    province: "山东省",
    baseMin: 4_504,
    baseMax: 22_518,
    baseLabel: "社保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.003 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.085,
      unemployment: 0.007,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "山东省人力资源和社会保障厅",
    sourceUrl: "https://hrss.shandong.gov.cn/",
  },
  {
    id: "dongguan",
    city: "东莞",
    province: "广东省",
    baseMin: 4_775,
    baseMax: 27_549,
    baseLabel: "医保",
    effectiveLabel: "2025年7月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.002 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.055,
      unemployment: 0.008,
      injuryMin: 0.002,
      injuryMax: 0.014,
    },
    fixedMedical: 0,
    sourceName: "东莞市人力资源和社会保障局",
    sourceUrl: "https://dghrss.dg.gov.cn/",
    note: "不同险种基数边界可能不同，本结果为综合预算估算。",
  },
  {
    id: "ningbo",
    city: "宁波",
    province: "浙江省",
    baseMin: 4_986,
    baseMax: 25_299,
    baseLabel: "社保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.095,
      unemployment: 0.005,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "国家税务总局浙江省税务局",
    sourceUrl: "https://zhejiang.chinatax.gov.cn/art/2025/12/11/art_13314_645797.html",
  },
  {
    id: "hefei",
    city: "合肥",
    province: "安徽省",
    baseMin: 4_311,
    baseMax: 21_556,
    baseLabel: "医保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.08,
      unemployment: 0.005,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "安徽省人力资源和社会保障厅",
    sourceUrl: "https://hrss.ah.gov.cn/",
    note: "展示范围为医保代表口径，养老等险种可能采用不同基数范围。",
  },
  {
    id: "xiamen",
    city: "厦门",
    province: "福建省",
    baseMin: 4_043,
    baseMax: 22_607,
    baseLabel: "社保",
    effectiveLabel: "2025年1月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.005 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.075,
      unemployment: 0.005,
      injuryMin: 0.002,
      injuryMax: 0.019,
    },
    fixedMedical: 0,
    sourceName: "福建省人力资源和社会保障厅",
    sourceUrl: "https://rst.fujian.gov.cn/",
  },
  {
    id: "foshan",
    city: "佛山",
    province: "广东省",
    baseMin: 4_775,
    baseMax: 27_549,
    baseLabel: "养老",
    effectiveLabel: "2025年7月起",
    rates: { pension: 0.08, medical: 0.02, unemployment: 0.002 },
    employerRates: {
      pension: 0.16,
      medicalAndMaternity: 0.05,
      unemployment: 0.008,
      injuryMin: 0.002,
      injuryMax: 0.014,
    },
    fixedMedical: 0,
    sourceName: "广东省人力资源和社会保障厅",
    sourceUrl: "https://hrss.gd.gov.cn/",
    note: "展示范围为养老代表口径，医保等险种可能采用不同基数范围。",
  },
];

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function getSocialSecurityPolicy(policyId: string): SocialSecurityPolicy {
  return (
    SOCIAL_SECURITY_POLICIES.find((policy) => policy.id === policyId) ??
    SOCIAL_SECURITY_POLICIES[0]
  );
}

export function estimateSocialInsurance(
  policy: SocialSecurityPolicy,
  contributionWage: number,
): SocialSecurityEstimate {
  const safeWage = Number.isFinite(contributionWage) ? Math.max(0, contributionWage) : 0;
  const contributionBase = Math.min(policy.baseMax, Math.max(policy.baseMin, safeWage));
  const pension = roundCurrency(contributionBase * policy.rates.pension);
  const medical = roundCurrency(contributionBase * policy.rates.medical + policy.fixedMedical);
  const unemployment = roundCurrency(contributionBase * policy.rates.unemployment);

  return {
    contributionWage: safeWage,
    contributionBase,
    pension,
    medical,
    unemployment,
    total: roundCurrency(pension + medical + unemployment),
    capStatus:
      safeWage < policy.baseMin
        ? "floor"
        : safeWage > policy.baseMax
          ? "ceiling"
          : "within",
  };
}

export function estimateEmployerSocialInsurance(
  policy: SocialSecurityPolicy,
  contributionWage: number,
): EmployerSocialSecurityEstimate {
  const safeWage = Number.isFinite(contributionWage) ? Math.max(0, contributionWage) : 0;
  const contributionBase = Math.min(policy.baseMax, Math.max(policy.baseMin, safeWage));
  const pension = roundCurrency(contributionBase * policy.employerRates.pension);
  const medicalAndMaternity = roundCurrency(
    contributionBase * policy.employerRates.medicalAndMaternity,
  );
  const unemployment = roundCurrency(contributionBase * policy.employerRates.unemployment);
  const injury = roundCurrency(contributionBase * policy.employerRates.injuryMin);
  const rateMin =
    policy.employerRates.pension +
    policy.employerRates.medicalAndMaternity +
    policy.employerRates.unemployment +
    policy.employerRates.injuryMin;
  const rateMax =
    policy.employerRates.pension +
    policy.employerRates.medicalAndMaternity +
    policy.employerRates.unemployment +
    policy.employerRates.injuryMax;

  return {
    contributionWage: safeWage,
    contributionBase,
    pension,
    medicalAndMaternity,
    unemployment,
    injury,
    total: roundCurrency(pension + medicalAndMaternity + unemployment + injury),
    rateMin,
    rateMax,
    capStatus:
      safeWage < policy.baseMin
        ? "floor"
        : safeWage > policy.baseMax
          ? "ceiling"
          : "within",
  };
}
