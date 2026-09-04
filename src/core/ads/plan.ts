import type { UserRole } from "@/types/auth";

export const ADS_PLANS = ["free", "pro", "business", "enterprise"] as const;

export type AdsPlan = (typeof ADS_PLANS)[number];

export type AdsQuotas = {
  readonly campaigns: number;
  readonly creatives: number;
  readonly generatePerDay: number;
  readonly audiencePerDay: number;
  readonly landingPerDay: number;
  readonly analyzePerDay: number;
};

export const ADS_QUOTAS: Record<AdsPlan, AdsQuotas> = {
  free: {
    campaigns: 5,
    creatives: 15,
    generatePerDay: 8,
    audiencePerDay: 8,
    landingPerDay: 3,
    analyzePerDay: 10,
  },
  pro: {
    campaigns: 50,
    creatives: 200,
    generatePerDay: 80,
    audiencePerDay: 80,
    landingPerDay: 30,
    analyzePerDay: 80,
  },
  business: {
    campaigns: 200,
    creatives: 1000,
    generatePerDay: 300,
    audiencePerDay: 300,
    landingPerDay: 100,
    analyzePerDay: 300,
  },
  enterprise: {
    campaigns: 2000,
    creatives: 10000,
    generatePerDay: 1000,
    audiencePerDay: 1000,
    landingPerDay: 400,
    analyzePerDay: 1000,
  },
};

export type AdsUsageKind = "generate" | "audience" | "landing" | "analyze";

export function resolveAdsPlan(role: UserRole, hasActiveSubscription: boolean): AdsPlan {
  if (role === "admin" || role === "enterprise") {
    return "enterprise";
  }

  if (role === "business") {
    return "business";
  }

  if (role === "pro" || hasActiveSubscription) {
    return "pro";
  }

  return "free";
}

export function quotaForUsage(plan: AdsPlan, kind: AdsUsageKind): number {
  const quotas = ADS_QUOTAS[plan];
  if (kind === "generate") return quotas.generatePerDay;
  if (kind === "audience") return quotas.audiencePerDay;
  if (kind === "landing") return quotas.landingPerDay;
  return quotas.analyzePerDay;
}

export function secondsUntilUtcMidnight(now = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

export function utcDay(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
