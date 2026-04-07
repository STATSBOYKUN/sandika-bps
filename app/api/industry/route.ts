import { createHash } from "node:crypto";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { normalizeKbliKategori } from "@/components/data-industri/types";
import { auth } from "@/lib/auth";
import {
	inferKbliKategoriFromGoogleMapsFilename,
	mapIndustryRecordToRow,
} from "@/lib/industry";
import { prisma } from "@/lib/prisma";

const MAX_IMPORT_ROWS = 5000;

type ImportPlatform = "Google Maps" | "YouTube" | "TikTok";

type NormalizedRow = Record<string, string>;

type ImportRecord = {
	sourceKey: string;
	platform: ImportPlatform;
	namaUsaha: string;
	kbliKategori: string;
	provinsiId: string | null;
	kabupatenId: string | null;
	kecamatanId: string | null;
	kecamatanNama: string | null;
	desaId: string | null;
	desaNama: string | null;
	status: "Aktif" | "Verifikasi" | "Draft";
	isInsideKaranganyar: boolean;
	metadata: Record<string, unknown>;
};

type ImportOptions = {
	googleMapsDefaultKbli?: string;
	defaultKbli?: string;
	forceStatus?: ImportRecord["status"];
};

function normalizeHeader(value: string) {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pick(row: NormalizedRow, candidates: string[]) {
	for (const key of candidates) {
		const value = row[key];
		if (value && value.trim()) return value.trim();
	}
	return "";
}

function parseNumber(value: string, fallback = 0) {
	const normalized = value.replace(/[^\d,.-]/g, "").replace(/,/g, "");
	if (!normalized) return fallback;
	const num = Number(normalized);
	return Number.isFinite(num) ? num : fallback;
}

function parseBoolean(value: string, fallback = true) {
	const normalized = value.trim().toLowerCase();
	if (!normalized) return fallback;
	if (["1", "true", "ya", "yes", "y"].includes(normalized)) {
		return true;
	}
	if (["0", "false", "tidak", "no", "n"].includes(normalized)) {
		return false;
	}
	return fallback;
}

function parseStatus(value: string): ImportRecord["status"] {
	const normalized = value.trim().toLowerCase();
	if (normalized === "aktif") return "Aktif";
	if (normalized === "draft") return "Draft";
	return "Verifikasi";
}

function parsePlatform(row: NormalizedRow): ImportPlatform | null {
	const rawPlatform = pick(row, ["platform", "sumberplatform", "source"])
		.toLowerCase()
		.trim();

	if (rawPlatform.includes("google")) return "Google Maps";
	if (rawPlatform.includes("youtube")) return "YouTube";
	if (rawPlatform.includes("tiktok") || rawPlatform.includes("tik tok")) {
		return "TikTok";
	}

	const hasLatLong =
		pick(row, ["latitude", "lat"]) &&
		pick(row, ["longitude", "long", "lng"]);
	if (hasLatLong) return "Google Maps";

	if (
		pick(row, ["channelid", "channel_id", "channeltitle", "channel_name"])
	) {
		return "YouTube";
	}

	if (pick(row, ["authorid", "author_id", "authorusername", "username"])) {
		return "TikTok";
	}

	return null;
}

function buildSourceKey(
	platform: ImportPlatform,
	row: NormalizedRow,
	index: number,
) {
	const provided = pick(row, ["sourcekey", "source_key", "id"]);
	if (provided) return provided;

	const seed = [
		platform,
		pick(row, ["namausaha", "nama_usaha", "title", "name"]),
		pick(row, [
			"placeid",
			"place_id",
			"channelid",
			"channel_id",
			"videoid",
			"video_id",
		]),
		pick(row, [
			"videourl",
			"video_url",
			"mapsurl",
			"maps_url",
			"link",
			"url",
		]),
		pick(row, ["latitude", "lat"]),
		pick(row, ["longitude", "long", "lng"]),
		String(index),
	].join("|");

	const hash = createHash("sha1").update(seed).digest("hex").slice(0, 18);
	const prefix =
		platform === "Google Maps"
			? "gm"
			: platform === "YouTube"
				? "yt"
				: "tt";
	return `${prefix}:import:${hash}`;
}

function normalizeSpreadsheetRows(rows: Array<Record<string, unknown>>) {
	return rows
		.map((raw) => {
			const normalized: NormalizedRow = {};
			for (const [key, value] of Object.entries(raw)) {
				normalized[normalizeHeader(key)] = String(value ?? "").trim();
			}
			return normalized;
		})
		.filter((row) => Object.values(row).some((value) => value.length > 0));
}

function buildImportRecord(
	row: NormalizedRow,
	index: number,
	options: ImportOptions = {},
): ImportRecord | null {
	const platform = parsePlatform(row);
	if (!platform) return null;

	const namaUsaha =
		pick(row, ["namausaha", "nama_usaha", "title", "name"]) ||
		`Baris ${index + 1}`;
	const sourceKey = buildSourceKey(platform, row, index);
	const fallbackKbli =
		options.defaultKbli ||
		(platform === "Google Maps"
			? options.googleMapsDefaultKbli || "J"
			: "J");
	const kbliKategori = normalizeKbliKategori(
		pick(row, ["kblikategori", "kbli", "kbli_kategori"]) || fallbackKbli,
	);
	const status = options.forceStatus ?? parseStatus(pick(row, ["status"]));

	const kecamatanNama =
		pick(row, ["kecamatannama", "kecamatan", "wilayahkecamatannama"]) ||
		null;
	const desaNama = pick(row, ["desanama", "desa", "wilayahdesanama"]) || null;

	const provinsiId = pick(row, ["provinsiid", "wilayahprovinsiid"]) || null;
	const kabupatenId =
		pick(row, ["kabupatenid", "wilayahkabupatenid"]) || null;
	const kecamatanId =
		pick(row, ["kecamatanid", "wilayahkecamatanid"]) || null;
	const desaId = pick(row, ["desaid", "wilayahdesaid"]) || null;

	const isInsideKaranganyar = parseBoolean(
		pick(row, ["isinsidekaranganyar", "insidekaranganyar"]),
		true,
	);

	if (platform === "Google Maps") {
		const latitude = parseNumber(pick(row, ["latitude", "lat"]));
		const longitude = parseNumber(pick(row, ["longitude", "long", "lng"]));
		const placeId =
			pick(row, ["placeid", "place_id", "pluscode", "plus_code"]) ||
			sourceKey;

		return {
			sourceKey,
			platform,
			namaUsaha,
			kbliKategori,
			provinsiId,
			kabupatenId,
			kecamatanId,
			kecamatanNama,
			desaId,
			desaNama,
			status,
			isInsideKaranganyar,
			metadata: {
				wilayah: {
					provinsi: {
						id: provinsiId ?? "",
						nama: pick(row, [
							"wilayahprovinsinama",
							"provinsinama",
						]),
					},
					kabupaten: {
						id: kabupatenId ?? "",
						nama: pick(row, [
							"wilayahkabupatennama",
							"kabupatennama",
						]),
					},
					kecamatan: {
						id: kecamatanId ?? "",
						nama: kecamatanNama ?? "",
					},
					desa: {
						id: desaId ?? "",
						nama: desaNama ?? "",
					},
				},
				latitude,
				longitude,
				category: pick(row, ["category"]),
				address: pick(row, ["address"]),
				openHours: pick(row, ["openhours", "open_hours"]),
				popularTimes: pick(row, ["populartimes", "popular_times"]),
				website: pick(row, ["website"]),
				phone: pick(row, ["phone"]),
				plusCode: pick(row, ["pluscode", "plus_code"]),
				placeId,
				cid: pick(row, ["cid"]),
				mapsUrl:
					pick(row, ["mapsurl", "maps_url", "link", "url"]) || "",
				rating: parseNumber(
					pick(row, ["rating", "reviewrating", "review_rating"]),
				),
				reviewCount: Math.trunc(
					parseNumber(pick(row, ["reviewcount", "review_count"])),
				),
				sourceStatus: pick(row, ["status"]),
				descriptions: pick(row, ["descriptions"]),
				reviewsLink: pick(row, ["reviewslink", "reviews_link"]),
				thumbnail: pick(row, ["thumbnail"]),
				timezone: pick(row, ["timezone"]),
				priceRange: pick(row, ["pricerange", "price_range"]),
				dataId: pick(row, ["dataid", "data_id"]),
				images: pick(row, ["images"]),
				reservations: pick(row, ["reservations"]),
				orderOnline: pick(row, ["orderonline", "order_online"]),
				menu: pick(row, ["menu"]),
				owner: pick(row, ["owner"]),
				completeAddress: pick(row, [
					"completeaddress",
					"complete_address",
				]),
				about: pick(row, ["about"]),
				userReviews: pick(row, ["userreviews", "user_reviews"]),
				userReviewsExtended: pick(row, [
					"userreviewsextended",
					"user_reviews_extended",
				]),
				emails: pick(row, ["emails"]),
			},
		};
	}

	if (platform === "YouTube") {
		const channelId =
			pick(row, ["channelid", "channel_id"]) || `channel-${index + 1}`;

		return {
			sourceKey,
			platform,
			namaUsaha,
			kbliKategori,
			provinsiId: null,
			kabupatenId: null,
			kecamatanId: null,
			kecamatanNama,
			desaId: null,
			desaNama,
			status,
			isInsideKaranganyar,
			metadata: {
				channelId,
				channelTitle:
					pick(row, [
						"channeltitle",
						"channelname",
						"channel_name",
					]) || namaUsaha,
				videoId:
					pick(row, ["videoid", "video_id"]) ||
					`${channelId}-${index + 1}`,
				videoTitle:
					pick(row, ["videotitle", "video_title", "title"]) ||
					`Konten dari ${namaUsaha}`,
				videoUrl:
					pick(row, ["videourl", "video_url", "url"]) ||
					`https://www.youtube.com/channel/${channelId}`,
				publishedAt: pick(row, [
					"publishedat",
					"published_at",
					"createdat",
					"created_at",
				]),
				viewCount: Math.trunc(
					parseNumber(
						pick(row, ["viewcount", "totalviews", "views"]),
					),
				),
				likeCount: Math.trunc(
					parseNumber(pick(row, ["likecount", "likes"])),
				),
				commentCount: Math.trunc(
					parseNumber(pick(row, ["commentcount", "comments"])),
				),
				subscriberCount: Math.trunc(
					parseNumber(pick(row, ["subscribercount", "subscribers"])),
				),
			},
		};
	}

	const authorId =
		pick(row, ["authorid", "author_id", "creatorid", "creator_id"]) ||
		`author-${index + 1}`;
	const authorUsername =
		pick(row, ["authorusername", "author_username", "username"]) ||
		"@unknown";

	return {
		sourceKey,
		platform,
		namaUsaha,
		kbliKategori,
		provinsiId: null,
		kabupatenId: null,
		kecamatanId: null,
		kecamatanNama,
		desaId: null,
		desaNama,
		status,
		isInsideKaranganyar,
		metadata: {
			authorId,
			authorUsername,
			videoId:
				pick(row, ["videoid", "video_id", "id"]) ||
				`${authorId}-${index + 1}`,
			videoTitle:
				pick(row, ["videotitle", "video_title", "title"]) ||
				`Video TikTok ${index + 1}`,
			videoUrl: pick(row, ["videourl", "video_url", "url"]),
			publishedAt: pick(row, [
				"publishedat",
				"published_at",
				"createdat",
				"created_at",
			]),
			viewCount: Math.trunc(
				parseNumber(pick(row, ["viewcount", "views"])),
			),
			likeCount: Math.trunc(
				parseNumber(pick(row, ["likecount", "likes"])),
			),
			commentCount: Math.trunc(
				parseNumber(pick(row, ["commentcount", "comments"])),
			),
			shareCount: Math.trunc(
				parseNumber(pick(row, ["sharecount", "shares"])),
			),
			followerCount: Math.trunc(
				parseNumber(pick(row, ["followercount", "followers"])),
			),
		},
	};
}

export async function GET() {
	const industryClient = (
		prisma as unknown as {
			industryRecord: {
				findMany: (args: {
					orderBy: { updatedAt: "desc" };
				}) => Promise<unknown[]>;
			};
		}
	).industryRecord;

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

	const sanitizedRows = rows.map((row) => {
		if (row.platform === "Google Maps") return row;

		return Object.fromEntries(
			Object.entries(row).filter(
				([key]) => key !== "kecamatanNama" && key !== "desaNama",
			),
		);
	});

	return NextResponse.json({ data: sanitizedRows });
}

export async function POST(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get("file");

	if (!(file instanceof File)) {
		return NextResponse.json(
			{ message: "File tidak ditemukan." },
			{ status: 400 },
		);
	}

	const filename = file.name.toLowerCase();
	if (!filename.endsWith(".csv") && !filename.endsWith(".xlsx")) {
		return NextResponse.json(
			{ message: "Format file harus .csv atau .xlsx." },
			{ status: 400 },
		);
	}

	const googleMapsDefaultKbli = await inferKbliKategoriFromGoogleMapsFilename(
		file.name,
	);
	const defaultKbli = normalizeKbliKategori(
		String(formData.get("defaultKbli") ?? ""),
	);
	const forceStatusInput = String(formData.get("forceStatus") ?? "").trim();
	const forceStatus: ImportRecord["status"] | undefined =
		forceStatusInput === "Aktif" ||
		forceStatusInput === "Verifikasi" ||
		forceStatusInput === "Draft"
			? forceStatusInput
			: undefined;
	const maxRowsInput = Number.parseInt(
		String(formData.get("maxRows") ?? ""),
		10,
	);
	const effectiveMaxRows = Number.isFinite(maxRowsInput)
		? Math.max(1, Math.min(maxRowsInput, MAX_IMPORT_ROWS))
		: MAX_IMPORT_ROWS;
	const bytes = await file.arrayBuffer();
	const workbook = XLSX.read(bytes, { type: "array", raw: false });

	const allRows = workbook.SheetNames.flatMap((sheetName: string) => {
		const sheet = workbook.Sheets[sheetName];
		const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
			defval: "",
		});
		return normalizeSpreadsheetRows(rows);
	});

	if (!allRows.length) {
		return NextResponse.json(
			{ message: "File tidak memiliki baris data." },
			{ status: 400 },
		);
	}

	const rowsToImport = allRows.slice(0, effectiveMaxRows);
	const industryClient = (
		prisma as unknown as {
			industryRecord: {
				upsert: (args: {
					where: { sourceKey: string };
					create: Record<string, unknown>;
					update: Record<string, unknown>;
				}) => Promise<unknown>;
			};
		}
	).industryRecord;

	let imported = 0;
	let skipped = 0;
	const errors: string[] = [];

	for (let index = 0; index < rowsToImport.length; index += 1) {
		const row = rowsToImport[index];
		const parsed = buildImportRecord(row, index, {
			googleMapsDefaultKbli,
			defaultKbli: defaultKbli || undefined,
			forceStatus,
		});

		if (!parsed) {
			skipped += 1;
			if (errors.length < 10) {
				errors.push(`Baris ${index + 2}: platform tidak dikenali.`);
			}
			continue;
		}

		try {
			await industryClient.upsert({
				where: { sourceKey: parsed.sourceKey },
				create: parsed,
				update: {
					platform: parsed.platform,
					namaUsaha: parsed.namaUsaha,
					kbliKategori: parsed.kbliKategori,
					provinsiId: parsed.provinsiId,
					kabupatenId: parsed.kabupatenId,
					kecamatanId: parsed.kecamatanId,
					kecamatanNama: parsed.kecamatanNama,
					desaId: parsed.desaId,
					desaNama: parsed.desaNama,
					status: parsed.status,
					isInsideKaranganyar: parsed.isInsideKaranganyar,
					metadata: parsed.metadata,
				},
			});
			imported += 1;
		} catch {
			skipped += 1;
			if (errors.length < 10) {
				errors.push(`Baris ${index + 2}: gagal disimpan ke database.`);
			}
		}
	}

	return NextResponse.json({
		message: "Import selesai.",
		imported,
		skipped,
		errors,
		truncated: allRows.length > effectiveMaxRows,
		effectiveMaxRows,
		totalRead: allRows.length,
	});
}
