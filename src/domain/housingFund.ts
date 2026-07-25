export interface HousingFundPolicy {
  id: string;
  city: string;
  baseMin: number;
  baseMax: number;
  rateMin: number;
  rateMax: number;
  supplementaryRateMax?: number;
  effectiveLabel: string;
  sourceName: string;
  sourceUrl: string;
}

export interface HousingFundEstimate {
  contributionWage: number;
  contributionBase: number;
  rate: number;
  ordinaryRate: number;
  supplementaryRate: number;
  personalAmount: number;
  capStatus: "floor" | "within" | "ceiling";
}

export const HOUSING_FUND_POLICIES: HousingFundPolicy[] = [
  {
    id: "beijing",
    city: "北京",
    baseMin: 2_540,
    baseMax: 35_811,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "北京市人民政府",
    sourceUrl: "https://www.beijing.gov.cn/fwcj/jiage/zffw1/685cd52595ff563574309b82.html",
  },
  {
    id: "shanghai",
    city: "上海",
    baseMin: 2_690,
    baseMax: 37_302,
    rateMin: 0.05,
    rateMax: 0.07,
    supplementaryRateMax: 0.05,
    effectiveLabel: "2025公积金年度",
    sourceName: "上海市公积金管理中心",
    sourceUrl: "https://www.shzfgjj.cn/html/newxxgk/zcwj/gfxwj/228051.html",
  },
  {
    id: "guangzhou",
    city: "广州",
    baseMin: 2_500,
    baseMax: 39_828,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "广州住房公积金管理中心",
    sourceUrl: "https://gjj.gz.gov.cn/",
  },
  {
    id: "shenzhen",
    city: "深圳",
    baseMin: 2_360,
    baseMax: 44_265,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "深圳市住房和建设局",
    sourceUrl: "https://www.sz.gov.cn/hdjlpt/detail?pid=3461939&via=pc",
  },
  {
    id: "hangzhou",
    city: "杭州",
    baseMin: 2_490,
    baseMax: 40_694,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "杭州住房公积金管理中心",
    sourceUrl: "https://gjj.hangzhou.gov.cn/",
  },
  {
    id: "chengdu",
    city: "成都",
    baseMin: 1_970,
    baseMax: 31_378,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公开基数",
    sourceName: "成都住房公积金管理中心",
    sourceUrl: "https://cdzfgjj.chengdu.gov.cn/",
  },
  {
    id: "nanjing",
    city: "南京",
    baseMin: 2_490,
    baseMax: 41_400,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "南京市人民政府",
    sourceUrl: "https://www.nanjing.gov.cn/",
  },
  {
    id: "wuhan",
    city: "武汉",
    baseMin: 2_210,
    baseMax: 34_560.25,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "武汉住房公积金管理中心",
    sourceUrl: "https://gjj.wuhan.gov.cn/",
  },
  {
    id: "suzhou",
    city: "苏州",
    baseMin: 2_490,
    baseMax: 38_900,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "苏州市人民政府",
    sourceUrl: "https://www.suzhou.gov.cn/",
  },
  {
    id: "tianjin",
    city: "天津",
    baseMin: 2_320,
    baseMax: 27_861,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "天津市住房公积金管理中心",
    sourceUrl: "https://www.zfgjj.cn/",
  },
  {
    id: "chongqing",
    city: "重庆",
    baseMin: 2_100,
    baseMax: 30_318,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "重庆市住房公积金管理中心",
    sourceUrl: "https://www.cqgjj.cn/",
  },
  {
    id: "xian",
    city: "西安",
    baseMin: 2_160,
    baseMax: 31_761,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "西安住房公积金管理中心",
    sourceUrl: "https://zfgjj.xa.gov.cn/",
  },
  {
    id: "changsha",
    city: "长沙",
    baseMin: 2_100,
    baseMax: 31_291,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "长沙住房公积金管理中心",
    sourceUrl: "https://gjjzx.changsha.gov.cn/",
  },
  {
    id: "zhengzhou",
    city: "郑州",
    baseMin: 2_100,
    baseMax: 27_520,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "郑州住房公积金管理中心",
    sourceUrl: "https://zzgjj.zhengzhou.gov.cn/",
  },
  {
    id: "qingdao",
    city: "青岛",
    baseMin: 2_200,
    baseMax: 33_093,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "青岛市人民政府",
    sourceUrl: "https://www.qingdao.gov.cn/",
  },
  {
    id: "dongguan",
    city: "东莞",
    baseMin: 2_080,
    baseMax: 27_391,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公开基数",
    sourceName: "东莞市住房公积金管理中心",
    sourceUrl: "https://dggjj.dg.gov.cn/",
  },
  {
    id: "ningbo",
    city: "宁波",
    baseMin: 2_490,
    baseMax: 38_907,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "宁波市住房和城乡建设局",
    sourceUrl: "https://zjw.ningbo.gov.cn/",
  },
  {
    id: "hefei",
    city: "合肥",
    baseMin: 2_060,
    baseMax: 30_540,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "合肥市住房公积金管理中心",
    sourceUrl: "https://gjjzx.hefei.gov.cn/",
  },
  {
    id: "xiamen",
    city: "厦门",
    baseMin: 2_265,
    baseMax: 32_346,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "厦门市住房公积金中心",
    sourceUrl: "https://gjj.xm.gov.cn/",
  },
  {
    id: "foshan",
    city: "佛山",
    baseMin: 2_080,
    baseMax: 28_959,
    rateMin: 0.05,
    rateMax: 0.12,
    effectiveLabel: "2025公积金年度",
    sourceName: "佛山市住房公积金管理中心",
    sourceUrl: "https://fsgjj.foshan.gov.cn/",
  },
];

export function getHousingFundPolicy(policyId: string): HousingFundPolicy {
  return HOUSING_FUND_POLICIES.find((policy) => policy.id === policyId) ?? HOUSING_FUND_POLICIES[0];
}

export function getHousingFundRateOptions(policy: HousingFundPolicy): number[] {
  const minPercent = Math.round(policy.rateMin * 100);
  const maxPercent = Math.round(
    (policy.rateMax + (policy.supplementaryRateMax ?? 0)) * 100,
  );
  return Array.from({ length: maxPercent - minPercent + 1 }, (_, index) =>
    (minPercent + index) / 100,
  );
}

export function estimateHousingFund(
  policy: HousingFundPolicy,
  contributionWage: number,
  requestedRate: number,
): HousingFundEstimate {
  const safeWage = Number.isFinite(contributionWage) ? Math.max(0, contributionWage) : 0;
  const contributionBase = Math.min(policy.baseMax, Math.max(policy.baseMin, safeWage));
  const safeRate = Number.isFinite(requestedRate) ? requestedRate : policy.rateMin;
  const totalRateMax = policy.rateMax + (policy.supplementaryRateMax ?? 0);
  const rate = Math.min(totalRateMax, Math.max(policy.rateMin, safeRate));
  const ordinaryRate = Math.min(policy.rateMax, rate);
  const supplementaryRate = Math.max(0, rate - ordinaryRate);

  return {
    contributionWage: safeWage,
    contributionBase,
    rate,
    ordinaryRate,
    supplementaryRate,
    personalAmount: Math.round(contributionBase * rate),
    capStatus:
      safeWage < policy.baseMin
        ? "floor"
        : safeWage > policy.baseMax
          ? "ceiling"
          : "within",
  };
}
