import { prisma } from "@/core/database/prisma";

import { ADS_PLATFORMS } from "./schema";

export const ADS_PLATFORM_LABELS: Record<(typeof ADS_PLATFORMS)[number], string> = {
  meta: "Meta",
  google: "Google Ads",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

const NOT_CONNECTED_NOTE =
  "Not connected. Aila Ads stores campaign plans and copy on your account. It does not buy ads or read live metrics until a real platform connection exists.";

export type AdsConnectionDto = {
  id: string;
  platform: string;
  label: string;
  status: "not_connected";
  note: string;
  updatedAt: string;
};

export async function listAdsConnections(userId: string): Promise<AdsConnectionDto[]> {
  const existing = await prisma.adsPlatformConnection.findMany({
    where: { userId },
  });

  const byPlatform = new Map(existing.map((row) => [row.platform, row]));
  const records = [];

  for (const platform of ADS_PLATFORMS) {
    const current = byPlatform.get(platform);
    if (current) {
      records.push(current);
      continue;
    }

    records.push(
      await prisma.adsPlatformConnection.create({
        data: {
          userId,
          platform,
          status: "not_connected",
          note: NOT_CONNECTED_NOTE,
        },
      }),
    );
  }

  return records.map((record) => ({
    id: record.id,
    platform: record.platform,
    label: ADS_PLATFORM_LABELS[record.platform as (typeof ADS_PLATFORMS)[number]] ?? record.platform,
    status: "not_connected",
    note: record.note ?? NOT_CONNECTED_NOTE,
    updatedAt: record.updatedAt.toISOString(),
  }));
}

export function anyPlatformConnected(connections: AdsConnectionDto[]): boolean {
  return connections.some((connection) => connection.status !== "not_connected");
}
