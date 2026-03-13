import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActivityIconKey = "account" | "industry";

type ProfileActivity = {
	id: string;
	label: string;
	timestamp: string;
	iconKey: ActivityIconKey;
};

type SessionRow = {
	id: string;
	createdAt: Date;
	ipAddress: string | null;
	userAgent: string | null;
};

type IndustryRow = {
	id: string;
	namaUsaha: string;
	platform: string;
	kecamatanNama: string | null;
	updatedAt: Date;
};

function parseMillis(value: string) {
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function getDeviceLabel(userAgent: string | null) {
	if (!userAgent) return "perangkat tidak dikenal";
	const value = userAgent.toLowerCase();

	if (value.includes("android")) return "Android";
	if (value.includes("iphone") || value.includes("ios")) return "iPhone";
	if (value.includes("windows")) return "Windows";
	if (value.includes("macintosh") || value.includes("mac os")) return "Mac";
	if (value.includes("linux")) return "Linux";

	return "perangkat tidak dikenal";
}

function mapSessionToActivity(row: SessionRow): ProfileActivity {
	const device = getDeviceLabel(row.userAgent);
	const ipSuffix = row.ipAddress ? ` (${row.ipAddress})` : "";

	return {
		id: `session-${row.id}`,
		label: `Login akun dari ${device}${ipSuffix}`,
		timestamp: row.createdAt.toISOString(),
		iconKey: "account",
	};
}

function mapIndustryToActivity(row: IndustryRow): ProfileActivity {
	const area = row.kecamatanNama ?? "wilayah tidak diketahui";

	return {
		id: `industry-${row.id}`,
		label: `Data industri ${row.namaUsaha} (${row.platform}) diperbarui di ${area}`,
		timestamp: row.updatedAt.toISOString(),
		iconKey: "industry",
	};
}

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const db = prisma as unknown as {
		session?: {
			findMany: (args: {
				where: { userId: string };
				orderBy: { createdAt: "desc" };
				take: number;
				select: {
					id: true;
					createdAt: true;
					ipAddress: true;
					userAgent: true;
				};
			}) => Promise<SessionRow[]>;
		};
		industryRecord?: {
			findMany: (args: {
				orderBy: { updatedAt: "desc" };
				take: number;
				select: {
					id: true;
					namaUsaha: true;
					platform: true;
					kecamatanNama: true;
					updatedAt: true;
				};
			}) => Promise<IndustryRow[]>;
		};
	};

	const [sessionRows, industryRows] = await Promise.all([
		db.session?.findMany({
			where: { userId: session.user.id },
			orderBy: { createdAt: "desc" },
			take: 6,
			select: {
				id: true,
				createdAt: true,
				ipAddress: true,
				userAgent: true,
			},
		}) ?? Promise.resolve([]),
		db.industryRecord?.findMany({
			orderBy: { updatedAt: "desc" },
			take: 6,
			select: {
				id: true,
				namaUsaha: true,
				platform: true,
				kecamatanNama: true,
				updatedAt: true,
			},
		}) ?? Promise.resolve([]),
	]);

	const merged = [
		...sessionRows.map(mapSessionToActivity),
		...industryRows.map(mapIndustryToActivity),
	]
		.sort((a, b) => parseMillis(b.timestamp) - parseMillis(a.timestamp))
		.slice(0, 10);

	return NextResponse.json({ data: merged });
}
