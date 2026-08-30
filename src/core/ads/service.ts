import { prisma } from "@/core/database/prisma";
import {
  ConflictError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from "@/lib/errors/app-error";

import { analyzeStoredCampaign } from "./analysis";
import {
  analyseFetchedLandingPage,
  generateAdCopy,
  generateAudienceSuggestion,
  summariseStoredCampaign,
} from "./ai";
import { anyPlatformConnected, listAdsConnections } from "./connections";
import { fetchPublicLandingPage } from "./landing-page";
import {
  ADS_QUOTAS,
  quotaForUsage,
  secondsUntilUtcMidnight,
  utcDay,
  type AdsPlan,
  type AdsUsageKind,
} from "./plan";
import type {
  AudienceAssistBody,
  CreateAdsCampaignBody,
  CreateAdsCreativeBody,
  ListAdsQuery,
  UpdateAdsCampaignBody,
} from "./schema";
import { ADS_LIST_LIMIT } from "./schema";

export type AdsCampaignDto = {
  id: string;
  name: string;
  objective: string;
  budgetCents: number;
  plannedSpendCents: number | null;
  headline: string;
  body: string;
  targetingNotes: string | null;
  audience: string | null;
  location: string | null;
  landingPageUrl: string | null;
  conversionGoal: string | null;
  callToAction: string | null;
  currency: string;
  timezone: string;
  intendedPlatform: string | null;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  launchedAt: string | null;
  createdAt: string;
  updatedAt: string;
  creativeCount?: number;
};

export type AdsCreativeDto = {
  id: string;
  campaignId: string;
  source: "ai" | "user";
  variantLabel: string | null;
  headline: string;
  body: string;
  callToAction: string | null;
  createdAt: string;
};

export type AdsLandingAnalysisDto = {
  id: string;
  url: string;
  fetchStatus: string;
  httpStatus: number | null;
  title: string | null;
  excerpt: string | null;
  analysis: string | null;
  errorMessage: string | null;
  fetchedAt: string | null;
  createdAt: string;
};

export type AdsRecommendationDto = {
  id: string;
  kind: string;
  content: string;
  source: string;
  createdAt: string;
};

export type AdsUsageDto = {
  campaigns: number;
  creatives: number;
  generateToday: number;
  audienceToday: number;
  landingToday: number;
  analyzeToday: number;
};

export type AdsWorkspaceDto = {
  plan: AdsPlan;
  quotas: (typeof ADS_QUOTAS)[AdsPlan];
  usage: AdsUsageDto;
  connections: Awaited<ReturnType<typeof listAdsConnections>>;
  campaigns: AdsCampaignDto[];
};

type CampaignRecord = {
  id: string;
  name: string;
  objective: string;
  budgetCents: number;
  plannedSpendCents: number | null;
  headline: string;
  body: string;
  targetingNotes: string | null;
  audience: string | null;
  location: string | null;
  landingPageUrl: string | null;
  conversionGoal: string | null;
  callToAction: string | null;
  currency: string;
  timezone: string;
  intendedPlatform: string | null;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  launchedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function serializeCampaign(
  record: CampaignRecord,
  creativeCount?: number,
): AdsCampaignDto {
  return {
    id: record.id,
    name: record.name,
    objective: record.objective,
    budgetCents: record.budgetCents,
    plannedSpendCents: record.plannedSpendCents,
    headline: record.headline,
    body: record.body,
    targetingNotes: record.targetingNotes,
    audience: record.audience,
    location: record.location,
    landingPageUrl: record.landingPageUrl,
    conversionGoal: record.conversionGoal,
    callToAction: record.callToAction,
    currency: record.currency,
    timezone: record.timezone,
    intendedPlatform: record.intendedPlatform,
    status: record.status,
    startsAt: record.startsAt?.toISOString() ?? null,
    endsAt: record.endsAt?.toISOString() ?? null,
    launchedAt: record.launchedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    ...(creativeCount === undefined ? {} : { creativeCount }),
  };
}

function serializeCreative(record: {
  id: string;
  campaignId: string;
  source: string;
  variantLabel: string | null;
  headline: string;
  body: string;
  callToAction: string | null;
  createdAt: Date;
}): AdsCreativeDto {
  return {
    id: record.id,
    campaignId: record.campaignId,
    source: record.source === "ai" ? "ai" : "user",
    variantLabel: record.variantLabel,
    headline: record.headline,
    body: record.body,
    callToAction: record.callToAction,
    createdAt: record.createdAt.toISOString(),
  };
}

async function requireOwnedCampaign(userId: string, id: string) {
  const existing = await prisma.adsCampaign.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new NotFoundError("Campaign");
  }
  return existing;
}

async function countToday(userId: string, kind: AdsUsageKind): Promise<number> {
  const row = await prisma.adsAiUsage.findUnique({
    where: { userId_day_kind: { userId, day: utcDay(), kind } },
    select: { count: true },
  });
  return row?.count ?? 0;
}

async function consumeAiUsage(userId: string, plan: AdsPlan, kind: AdsUsageKind) {
  const limit = quotaForUsage(plan, kind);
  const used = await countToday(userId, kind);
  if (used >= limit) {
    throw new RateLimitError(secondsUntilUtcMidnight(), {
      message: `Daily ${kind} limit reached on the ${plan} plan. Limits reset at UTC midnight, or upgrade for a higher allowance.`,
    });
  }

  await prisma.adsAiUsage.upsert({
    where: { userId_day_kind: { userId, day: utcDay(), kind } },
    create: { userId, day: utcDay(), kind, count: 1 },
    update: { count: { increment: 1 } },
  });
}

async function assertCampaignQuota(userId: string, plan: AdsPlan) {
  const count = await prisma.adsCampaign.count({ where: { userId } });
  const limit = ADS_QUOTAS[plan].campaigns;
  if (count >= limit) {
    throw new ConflictError({
      message:
        plan === "free"
          ? `Free includes ${limit} campaigns. Upgrade to Pro for more.`
          : `This ${plan} plan allows ${limit} campaigns.`,
    });
  }
}

async function assertCreativeQuota(userId: string, plan: AdsPlan, adding: number) {
  const count = await prisma.adsCreative.count({ where: { userId } });
  const limit = ADS_QUOTAS[plan].creatives;
  if (count + adding > limit) {
    throw new ConflictError({
      message:
        plan === "free"
          ? `Free includes ${limit} creatives. Upgrade to Pro for more.`
          : `This ${plan} plan allows ${limit} creatives.`,
    });
  }
}

async function usageFor(userId: string): Promise<AdsUsageDto> {
  const [campaigns, creatives, generateToday, audienceToday, landingToday, analyzeToday] =
    await Promise.all([
      prisma.adsCampaign.count({ where: { userId } }),
      prisma.adsCreative.count({ where: { userId } }),
      countToday(userId, "generate"),
      countToday(userId, "audience"),
      countToday(userId, "landing"),
      countToday(userId, "analyze"),
    ]);

  return {
    campaigns,
    creatives,
    generateToday,
    audienceToday,
    landingToday,
    analyzeToday,
  };
}

export async function getAdsWorkspace(userId: string, plan: AdsPlan): Promise<AdsWorkspaceDto> {
  const [campaigns, connections, usage] = await Promise.all([
    listUserAdsCampaigns(userId, {}),
    listAdsConnections(userId),
    usageFor(userId),
  ]);

  return {
    plan,
    quotas: ADS_QUOTAS[plan],
    usage,
    connections,
    campaigns,
  };
}

export async function listUserAdsCampaigns(userId: string, query: ListAdsQuery) {
  const records = await prisma.adsCampaign.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { headline: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? ADS_LIST_LIMIT,
    include: { _count: { select: { creatives: true } } },
  });

  return records.map((record) => serializeCampaign(record, record._count.creatives));
}

export async function createUserAdsCampaign(
  userId: string,
  plan: AdsPlan,
  body: CreateAdsCampaignBody,
) {
  await assertCampaignQuota(userId, plan);

  const record = await prisma.adsCampaign.create({
    data: {
      userId,
      name: body.name,
      objective: body.objective,
      budgetCents: body.budgetCents,
      plannedSpendCents: body.plannedSpendCents ?? body.budgetCents,
      headline: body.headline,
      body: body.body,
      targetingNotes: body.targetingNotes,
      audience: body.audience,
      location: body.location,
      landingPageUrl: body.landingPageUrl,
      conversionGoal: body.conversionGoal,
      callToAction: body.callToAction,
      currency: body.currency,
      timezone: body.timezone,
      intendedPlatform: body.intendedPlatform ?? null,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
    },
  });

  return serializeCampaign(record, 0);
}

export async function getUserAdsCampaign(userId: string, id: string) {
  const record = await prisma.adsCampaign.findFirst({
    where: { id, userId },
    include: {
      creatives: { orderBy: { createdAt: "desc" } },
      landingAnalyses: { orderBy: { createdAt: "desc" }, take: 8 },
      recommendations: { orderBy: { createdAt: "desc" }, take: 12 },
    },
  });

  if (!record) {
    throw new NotFoundError("Campaign");
  }

  return {
    campaign: serializeCampaign(record, record.creatives.length),
    creatives: record.creatives.map(serializeCreative),
    landingAnalyses: record.landingAnalyses.map((row) => ({
      id: row.id,
      url: row.url,
      fetchStatus: row.fetchStatus,
      httpStatus: row.httpStatus,
      title: row.title,
      excerpt: row.excerpt,
      analysis: row.analysis,
      errorMessage: row.errorMessage,
      fetchedAt: row.fetchedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
    recommendations: record.recommendations.map((row) => ({
      id: row.id,
      kind: row.kind,
      content: row.content,
      source: row.source,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function updateUserAdsCampaign(
  userId: string,
  id: string,
  body: UpdateAdsCampaignBody,
) {
  const existing = await requireOwnedCampaign(userId, id);

  if (existing.status === "ended" && body.status && body.status !== "ended") {
    throw new ConflictError({ message: "Ended campaigns cannot be reopened." });
  }

  if (body.status === "active") {
    const headline = body.headline ?? existing.headline;
    const copy = body.body ?? existing.body;
    if (!headline.trim()) {
      throw new ValidationError(
        { headline: "A headline is required before launching." },
        { message: "A headline is required before launching." },
      );
    }
    if (!copy.trim()) {
      throw new ValidationError(
        { body: "Body copy is required before launching." },
        { message: "Body copy is required before launching." },
      );
    }
  }

  const record = await prisma.adsCampaign.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.objective !== undefined ? { objective: body.objective } : {}),
      ...(body.budgetCents !== undefined ? { budgetCents: body.budgetCents } : {}),
      ...(body.plannedSpendCents !== undefined ? { plannedSpendCents: body.plannedSpendCents } : {}),
      ...(body.headline !== undefined ? { headline: body.headline } : {}),
      ...(body.body !== undefined ? { body: body.body } : {}),
      ...(body.targetingNotes !== undefined ? { targetingNotes: body.targetingNotes } : {}),
      ...(body.audience !== undefined ? { audience: body.audience } : {}),
      ...(body.location !== undefined ? { location: body.location } : {}),
      ...(body.landingPageUrl !== undefined ? { landingPageUrl: body.landingPageUrl } : {}),
      ...(body.conversionGoal !== undefined ? { conversionGoal: body.conversionGoal } : {}),
      ...(body.callToAction !== undefined ? { callToAction: body.callToAction } : {}),
      ...(body.currency !== undefined ? { currency: body.currency } : {}),
      ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
      ...(body.intendedPlatform !== undefined ? { intendedPlatform: body.intendedPlatform } : {}),
      ...(body.startsAt !== undefined ? { startsAt: body.startsAt ? new Date(body.startsAt) : null } : {}),
      ...(body.endsAt !== undefined ? { endsAt: body.endsAt ? new Date(body.endsAt) : null } : {}),
      ...(body.status !== undefined
        ? {
            status: body.status,
            launchedAt:
              body.status === "active" ? (existing.launchedAt ?? new Date()) : existing.launchedAt,
          }
        : {}),
    },
  });

  return serializeCampaign(record);
}

export async function deleteUserAdsCampaign(userId: string, id: string) {
  const existing = await requireOwnedCampaign(userId, id);

  if (existing.status === "active") {
    throw new ConflictError({ message: "Pause or end an active campaign before deleting it." });
  }

  await prisma.adsCampaign.delete({ where: { id } });
}

export async function createUserAdsCreative(
  userId: string,
  plan: AdsPlan,
  campaignId: string,
  body: CreateAdsCreativeBody,
) {
  await requireOwnedCampaign(userId, campaignId);
  await assertCreativeQuota(userId, plan, 1);

  const record = await prisma.adsCreative.create({
    data: {
      userId,
      campaignId,
      source: "user",
      variantLabel: body.variantLabel,
      headline: body.headline,
      body: body.body,
      callToAction: body.callToAction,
    },
  });

  return serializeCreative(record);
}

export async function applyCreativeToCampaign(userId: string, campaignId: string, creativeId: string) {
  await requireOwnedCampaign(userId, campaignId);
  const creative = await prisma.adsCreative.findFirst({
    where: { id: creativeId, campaignId, userId },
  });
  if (!creative) {
    throw new NotFoundError("Creative");
  }

  const campaign = await prisma.adsCampaign.update({
    where: { id: campaignId },
    data: {
      headline: creative.headline,
      body: creative.body,
      callToAction: creative.callToAction,
    },
  });

  return serializeCampaign(campaign);
}

export async function generateUserAdsCreatives(
  userId: string,
  plan: AdsPlan,
  campaignId: string,
  count: number,
) {
  const campaign = await requireOwnedCampaign(userId, campaignId);
  await assertCreativeQuota(userId, plan, count);
  await consumeAiUsage(userId, plan, "generate");

  const variations = await generateAdCopy({
    count,
    name: campaign.name,
    objective: campaign.objective,
    audience: campaign.audience,
    location: campaign.location,
    landingPageUrl: campaign.landingPageUrl,
    conversionGoal: campaign.conversionGoal,
    intendedPlatform: campaign.intendedPlatform,
    headline: campaign.headline,
    body: campaign.body,
  });

  const created = await prisma.$transaction(
    variations.map((variation, index) =>
      prisma.adsCreative.create({
        data: {
          userId,
          campaignId,
          source: "ai",
          variantLabel: variation.variantLabel ?? `Variation ${index + 1}`,
          headline: variation.headline,
          body: variation.body,
          callToAction: variation.callToAction,
        },
      }),
    ),
  );

  return created.map(serializeCreative);
}

export async function assistCampaignAudience(
  userId: string,
  plan: AdsPlan,
  body: AudienceAssistBody,
) {
  const campaign = await requireOwnedCampaign(userId, body.campaignId);
  await consumeAiUsage(userId, plan, "audience");

  const suggestion = await generateAudienceSuggestion({
    name: campaign.name,
    objective: campaign.objective,
    location: campaign.location,
    targetingNotes: campaign.targetingNotes,
    brief: body.brief,
  });

  const recommendation = await prisma.adsRecommendation.create({
    data: {
      userId,
      campaignId: campaign.id,
      kind: "audience",
      source: "ai_suggestion",
      content: `${suggestion.audience}\n\n${suggestion.rationale}`,
    },
  });

  let updated = serializeCampaign(campaign);
  if (body.apply) {
    updated = serializeCampaign(
      await prisma.adsCampaign.update({
        where: { id: campaign.id },
        data: {
          audience: suggestion.audience,
          ...(suggestion.location ? { location: suggestion.location } : {}),
        },
      }),
    );
  }

  return {
    labelledAs: "AI suggestion — not from a connected ad platform",
    suggestion,
    campaign: updated,
    recommendation: {
      id: recommendation.id,
      kind: recommendation.kind,
      content: recommendation.content,
      source: recommendation.source,
      createdAt: recommendation.createdAt.toISOString(),
    } satisfies AdsRecommendationDto,
  };
}

export async function analyzeUserAdsCampaign(userId: string, plan: AdsPlan, campaignId: string) {
  const detail = await getUserAdsCampaign(userId, campaignId);
  const connections = await listAdsConnections(userId);
  await consumeAiUsage(userId, plan, "analyze");

  const stored = analyzeStoredCampaign({
    name: detail.campaign.name,
    objective: detail.campaign.objective,
    status: detail.campaign.status,
    budgetCents: detail.campaign.budgetCents,
    plannedSpendCents: detail.campaign.plannedSpendCents,
    currency: detail.campaign.currency,
    headline: detail.campaign.headline,
    body: detail.campaign.body,
    audience: detail.campaign.audience,
    location: detail.campaign.location,
    landingPageUrl: detail.campaign.landingPageUrl,
    conversionGoal: detail.campaign.conversionGoal,
    callToAction: detail.campaign.callToAction,
    intendedPlatform: detail.campaign.intendedPlatform,
    targetingNotes: detail.campaign.targetingNotes,
    startsAt: detail.campaign.startsAt,
    endsAt: detail.campaign.endsAt,
    creativeCount: detail.creatives.length,
    landingFetchStatus: detail.landingAnalyses[0]?.fetchStatus ?? null,
    platformConnected: anyPlatformConnected(connections),
  });

  let summary: string | null = null;
  try {
    summary = await summariseStoredCampaign(
      stored.notes,
      JSON.stringify({
        campaign: detail.campaign,
        creativeCount: detail.creatives.length,
        latestLanding: detail.landingAnalyses[0]
          ? {
              url: detail.landingAnalyses[0].url,
              fetchStatus: detail.landingAnalyses[0].fetchStatus,
            }
          : null,
      }),
    );
  } catch {
    summary = null;
  }

  const recommendation = await prisma.adsRecommendation.create({
    data: {
      userId,
      campaignId,
      kind: "analysis",
      source: "stored_data",
      content: [summary, stored.notes.map((note) => `- ${note}`).join("\n")]
        .filter(Boolean)
        .join("\n\n"),
    },
  });

  return {
    analysis: stored,
    summary,
    liveMetrics: null,
    liveMetricsReason: "No ad platform is connected.",
    recommendation: {
      id: recommendation.id,
      kind: recommendation.kind,
      content: recommendation.content,
      source: recommendation.source,
      createdAt: recommendation.createdAt.toISOString(),
    } satisfies AdsRecommendationDto,
  };
}

export async function analyzeUserLandingPage(
  userId: string,
  plan: AdsPlan,
  input: { campaignId?: string; url: string },
) {
  const campaign = input.campaignId
    ? await requireOwnedCampaign(userId, input.campaignId)
    : null;
  await consumeAiUsage(userId, plan, "landing");

  const fetched = await fetchPublicLandingPage(input.url);
  let analysis: string | null = null;

  if (fetched.fetchStatus === "success" && fetched.excerpt) {
    try {
      analysis = await analyseFetchedLandingPage({
        url: input.url,
        title: fetched.title,
        excerpt: fetched.excerpt,
        objective: campaign?.objective ?? "unspecified",
        headline: campaign?.headline ?? "",
      });
    } catch {
      analysis = null;
    }
  }

  const record = await prisma.adsLandingPageAnalysis.create({
    data: {
      userId,
      campaignId: campaign?.id ?? null,
      url: input.url,
      fetchStatus: fetched.fetchStatus,
      httpStatus: fetched.httpStatus,
      title: fetched.title,
      excerpt: fetched.excerpt,
      analysis,
      errorMessage: fetched.errorMessage,
      fetchedAt: fetched.fetchStatus === "success" ? new Date() : null,
    },
  });

  if (campaign && fetched.fetchStatus === "success") {
    await prisma.adsCampaign.update({
      where: { id: campaign.id },
      data: { landingPageUrl: input.url },
    });
  }

  const dto: AdsLandingAnalysisDto = {
    id: record.id,
    url: record.url,
    fetchStatus: record.fetchStatus,
    httpStatus: record.httpStatus,
    title: record.title,
    excerpt: record.excerpt,
    analysis: record.analysis,
    errorMessage: record.errorMessage,
    fetchedAt: record.fetchedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  };

  return dto;
}
