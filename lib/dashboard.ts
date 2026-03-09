import type { IndustryPlatform, IndustryRow } from "@/components/data-industri/types";
import { mapIndustryRecordToRow } from "@/lib/industry";
import { prisma } from "@/lib/prisma";

type DashboardActivity = {
  id: string;
  namaUsaha: string;
  platform: IndustryPlatform;
  kecamatanNama: string;
  desaNama: string;
  updatedAt: string;
};

type DashboardSummary = {
  totalRecords: number;
  insideKaranganyarCount: number;
  outsideKaranganyarCount: number;
  updatedLast24HoursCount: number;
  platformCounts: Record<IndustryPlatform, number>;
  statusCounts: Record<IndustryRow["status"], number>;
  recentActivities: DashboardActivity[];
};

function parseUpdatedAtToMillis(value: string) {
  const iso = value.includes("T") ? value : value.replace(" ", "T");
  const withTimezone = iso.endsWith("Z") ? iso : `${iso}Z`;
  const parsed = Date.parse(withTimezone);
  if (Number.isFinite(parsed)) return parsed;
  return Date.parse(iso);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const industryClient = (prisma as unknown as {
    industryRecord?: {
      findMany: (args: {
        orderBy: { updatedAt: "desc" };
      }) => Promise<unknown[]>;
    };
  }).industryRecord;

  if (!industryClient) {
    return {
      totalRecords: 0,
      insideKaranganyarCount: 0,
      outsideKaranganyarCount: 0,
      updatedLast24HoursCount: 0,
      platformCounts: {
        "Google Maps": 0,
        YouTube: 0,
        TikTok: 0,
      },
      statusCounts: {
        Aktif: 0,
        Verifikasi: 0,
        Draft: 0,
      },
      recentActivities: [],
    };
  }

  const records = await industryClient.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const rows = records
    .map((record) =>
      mapIndustryRecordToRow(
        record as Parameters<typeof mapIndustryRecordToRow>[0],
      ),
    )
    .filter((row) => row !== null);

  const platformCounts: Record<IndustryPlatform, number> = {
    "Google Maps": 0,
    YouTube: 0,
    TikTok: 0,
  };

  const statusCounts: Record<IndustryRow["status"], number> = {
    Aktif: 0,
    Verifikasi: 0,
    Draft: 0,
  };

  let insideKaranganyarCount = 0;
  let updatedLast24HoursCount = 0;
  const now = Date.now();
  const DAY_IN_MS = 24 * 60 * 60 * 1000;

  rows.forEach((row) => {
    platformCounts[row.platform] += 1;
    statusCounts[row.status] += 1;

    if (row.isInsideKaranganyar) insideKaranganyarCount += 1;

    const updatedAtMs = parseUpdatedAtToMillis(row.updatedAt);
    if (Number.isFinite(updatedAtMs) && now - updatedAtMs <= DAY_IN_MS) {
      updatedLast24HoursCount += 1;
    }
  });

  return {
    totalRecords: rows.length,
    insideKaranganyarCount,
    outsideKaranganyarCount: rows.length - insideKaranganyarCount,
    updatedLast24HoursCount,
    platformCounts,
    statusCounts,
    recentActivities: rows.slice(0, 6).map((row) => ({
      id: row.id,
      namaUsaha: row.namaUsaha,
      platform: row.platform,
      kecamatanNama: row.kecamatanNama,
      desaNama: row.desaNama,
      updatedAt: row.updatedAt,
    })),
  };
}
