import { NextResponse } from "next/server";

import { mapIndustryRecordToRow } from "@/lib/industry";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const industryClient = (prisma as unknown as {
    industryRecord: {
      findMany: (args: { orderBy: { updatedAt: "desc" } }) => Promise<unknown[]>;
    };
  }).industryRecord;

  const records = await industryClient.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const rows = records
    .map((record) => mapIndustryRecordToRow(record as Parameters<typeof mapIndustryRecordToRow>[0]))
    .filter((row) => row !== null);

  return NextResponse.json({ data: rows });
}
