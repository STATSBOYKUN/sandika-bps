import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import * as XLSX from "xlsx";

import type {
	GoogleMapsMetadata,
	IndustryRow,
	TikTokMetadata,
	WilayahMetadata,
	YouTubeMetadata,
} from "@/components/data-industri/types";
import { normalizeKbliKategori } from "@/components/data-industri/types";
import karanganyarDesaGeoJson from "@/constant/geojson/karanganyar_desa.json";

const DEFAULT_KBLI = "J";
const GOOGLE_MERGE_NAME_PATTERN = /^merge\s+([a-z])/i;
const GOOGLE_CATEGORY_DIR_PATTERN = /^kat\s+([a-z])$/i;
const GOOGLE_MERGE_FILE_PATTERN = /^merge\s+[a-z]\.(xlsx|csv)$/i;

const DEFAULT_LOCATION = {
	provinsiId: "33",
	kabupatenId: "13",
	kecamatanId: "09",
	kecamatanNama: "Karanganyar",
	desaId: "1",
	desaNama: "Cangakan",
};

const PROVINSI_NAMA_BY_ID: Record<string, string> = {
	"33": "Jawa Tengah",
};

const KABUPATEN_NAMA_BY_ID: Record<string, string> = {
	"33.13": "Karanganyar",
	"13": "Karanganyar",
};

type GeoPoint = {
	lng: number;
	lat: number;
};

type DesaFeature = {
	properties?: {
		kode_kec?: string;
		kode_kd?: string;
		kel_desa?: string;
		kecamatan?: string;
		provinsi?: string;
		kab_kota?: string;
	};
	geometry?: {
		type?: string;
		coordinates?: unknown;
	};
};

type DesaSpatialRecord = {
	desaIdLong: string;
	desaIdShort: string;
	desaNama: string;
	kecamatanId: string;
	kecamatanNama: string;
	kabupatenId: string;
	kabupatenNama: string;
	provinsiId: string;
	provinsiNama: string;
	bbox: {
		minLng: number;
		minLat: number;
		maxLng: number;
		maxLat: number;
	};
	polygons: GeoPoint[][][];
	centroid: GeoPoint;
};

export type IndustrySeedInput = {
	sourceKey: string;
	platform: "Google Maps" | "YouTube" | "TikTok";
	namaUsaha: string;
	kbliKategori: string;
	provinsiId?: string;
	kabupatenId?: string;
	kecamatanId?: string;
	kecamatanNama: string | null;
	desaId?: string;
	desaNama: string | null;
	status: "Aktif" | "Verifikasi" | "Draft";
	isInsideKaranganyar: boolean;
	metadata: GoogleMapsMetadata | YouTubeMetadata | TikTokMetadata;
};

type DbIndustryRecord = {
	id: string;
	platform: string;
	namaUsaha: string;
	kbliKategori: string;
	provinsiId: string | null;
	kabupatenId: string | null;
	kecamatanId: string | null;
	kecamatanNama: string | null;
	desaId: string | null;
	desaNama: string | null;
	status: string;
	isInsideKaranganyar: boolean;
	metadata: unknown;
	updatedAt: Date;
};

function inferProvinsiNama(provinsiId: string) {
	return PROVINSI_NAMA_BY_ID[provinsiId] ?? "Tidak diketahui";
}

function inferKabupatenNama(provinsiId: string, kabupatenId: string) {
	return (
		KABUPATEN_NAMA_BY_ID[`${provinsiId}.${kabupatenId}`] ??
		KABUPATEN_NAMA_BY_ID[kabupatenId] ??
		"Tidak diketahui"
	);
}

function buildWilayahMetadata(input: {
	provinsiId: string;
	kabupatenId: string;
	kecamatanId: string;
	kecamatanNama: string;
	desaId: string;
	desaNama: string;
}): WilayahMetadata {
	return {
		provinsi: {
			id: input.provinsiId,
			nama: inferProvinsiNama(input.provinsiId),
		},
		kabupaten: {
			id: input.kabupatenId,
			nama: inferKabupatenNama(input.provinsiId, input.kabupatenId),
		},
		kecamatan: {
			id: input.kecamatanId,
			nama: input.kecamatanNama,
		},
		desa: {
			id: formatShortDesaId(input.desaId),
			nama: input.desaNama,
		},
	};
}

function formatShortDesaId(value: string) {
	const last = value.split(".").at(-1) ?? value;
	const trimmed = last.replace(/^0+/, "");
	return trimmed || "0";
}

function parseCoordinatePoint(value: unknown): GeoPoint | null {
	if (!Array.isArray(value) || value.length < 2) return null;
	const lng = Number(value[0]);
	const lat = Number(value[1]);
	if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
	return { lng, lat };
}

function parseMultiPolygonCoordinates(value: unknown): GeoPoint[][][] {
	if (!Array.isArray(value)) return [];
	const polygons: GeoPoint[][][] = [];

	for (const polygonRaw of value) {
		if (!Array.isArray(polygonRaw)) continue;
		const rings: GeoPoint[][] = [];

		for (const ringRaw of polygonRaw) {
			if (!Array.isArray(ringRaw)) continue;
			const ring: GeoPoint[] = [];
			for (const pointRaw of ringRaw) {
				const point = parseCoordinatePoint(pointRaw);
				if (point) ring.push(point);
			}
			if (ring.length >= 3) rings.push(ring);
		}

		if (rings.length > 0) polygons.push(rings);
	}

	return polygons;
}

function parsePolygons(geometry: DesaFeature["geometry"]): GeoPoint[][][] {
	if (!geometry?.type) return [];
	if (geometry.type === "MultiPolygon") {
		return parseMultiPolygonCoordinates(geometry.coordinates);
	}
	if (geometry.type === "Polygon") {
		const rings = parseMultiPolygonCoordinates([geometry.coordinates]);
		return rings;
	}
	return [];
}

function polygonBBox(polygons: GeoPoint[][][]) {
	let minLng = Number.POSITIVE_INFINITY;
	let minLat = Number.POSITIVE_INFINITY;
	let maxLng = Number.NEGATIVE_INFINITY;
	let maxLat = Number.NEGATIVE_INFINITY;

	for (const polygon of polygons) {
		for (const ring of polygon) {
			for (const point of ring) {
				if (point.lng < minLng) minLng = point.lng;
				if (point.lng > maxLng) maxLng = point.lng;
				if (point.lat < minLat) minLat = point.lat;
				if (point.lat > maxLat) maxLat = point.lat;
			}
		}
	}

	return { minLng, minLat, maxLng, maxLat };
}

function polygonsCentroid(polygons: GeoPoint[][][]) {
	let count = 0;
	let sumLng = 0;
	let sumLat = 0;
	for (const polygon of polygons) {
		for (const ring of polygon) {
			for (const point of ring) {
				sumLng += point.lng;
				sumLat += point.lat;
				count += 1;
			}
		}
	}

	if (count === 0) return { lng: 0, lat: 0 };
	return { lng: sumLng / count, lat: sumLat / count };
}

function pointInRing(point: GeoPoint, ring: GeoPoint[]) {
	let inside = false;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
		const xi = ring[i].lng;
		const yi = ring[i].lat;
		const xj = ring[j].lng;
		const yj = ring[j].lat;

		const intersects =
			yi > point.lat !== yj > point.lat &&
			point.lng <
				((xj - xi) * (point.lat - yi)) / (yj - yi + Number.EPSILON) +
					xi;

		if (intersects) inside = !inside;
	}
	return inside;
}

function pointInPolygon(point: GeoPoint, polygon: GeoPoint[][]) {
	const [outerRing, ...holes] = polygon;
	if (!outerRing || !pointInRing(point, outerRing)) return false;
	for (const hole of holes) {
		if (pointInRing(point, hole)) return false;
	}
	return true;
}

function pointInFeature(point: GeoPoint, feature: DesaSpatialRecord) {
	const { bbox } = feature;
	if (
		point.lng < bbox.minLng ||
		point.lng > bbox.maxLng ||
		point.lat < bbox.minLat ||
		point.lat > bbox.maxLat
	) {
		return false;
	}

	return feature.polygons.some((polygon) => pointInPolygon(point, polygon));
}

function squaredDistance(a: GeoPoint, b: GeoPoint) {
	const dx = a.lng - b.lng;
	const dy = a.lat - b.lat;
	return dx * dx + dy * dy;
}

function buildDesaSpatialRecords(): DesaSpatialRecord[] {
	const features =
		(karanganyarDesaGeoJson as { features?: DesaFeature[] }).features ?? [];
	const output: DesaSpatialRecord[] = [];

	for (const feature of features) {
		const props = feature.properties;
		if (
			!props?.kode_kec ||
			!props?.kode_kd ||
			!props?.kel_desa ||
			!props?.kecamatan
		) {
			continue;
		}

		const polygons = parsePolygons(feature.geometry);
		if (polygons.length === 0) continue;

		const kecamatanId = props.kode_kec.split(".").at(-1) ?? "00";
		const record: DesaSpatialRecord = {
			desaIdLong: props.kode_kd,
			desaIdShort: formatShortDesaId(props.kode_kd),
			desaNama: props.kel_desa,
			kecamatanId,
			kecamatanNama: props.kecamatan,
			kabupatenId: "13",
			kabupatenNama: props.kab_kota || "Karanganyar",
			provinsiId: "33",
			provinsiNama: props.provinsi || "Jawa Tengah",
			bbox: polygonBBox(polygons),
			polygons,
			centroid: polygonsCentroid(polygons),
		};

		output.push(record);
	}

	return output;
}

const DESA_SPATIAL_RECORDS = buildDesaSpatialRecords();
const DEFAULT_DESA_SPATIAL = DESA_SPATIAL_RECORDS[0] ?? null;

function getNearestDesa(point: GeoPoint) {
	let nearest: DesaSpatialRecord | null = null;
	let bestDistance = Number.POSITIVE_INFINITY;
	for (const desa of DESA_SPATIAL_RECORDS) {
		const distance = squaredDistance(point, desa.centroid);
		if (distance < bestDistance) {
			bestDistance = distance;
			nearest = desa;
		}
	}
	return nearest;
}

function getDefaultLocationFromSpatial() {
	const fallback = DEFAULT_DESA_SPATIAL;
	if (!fallback) return DEFAULT_LOCATION;

	return {
		provinsiId: fallback.provinsiId,
		kabupatenId: fallback.kabupatenId,
		kecamatanId: fallback.kecamatanId,
		kecamatanNama: fallback.kecamatanNama,
		desaId: fallback.desaIdShort,
		desaNama: fallback.desaNama,
	};
}

function inferLocationByCoordinate(latitude: number, longitude: number) {
	const point = { lat: latitude, lng: longitude };

	for (const desa of DESA_SPATIAL_RECORDS) {
		if (pointInFeature(point, desa)) {
			return {
				provinsiId: desa.provinsiId,
				kabupatenId: desa.kabupatenId,
				kecamatanId: desa.kecamatanId,
				kecamatanNama: desa.kecamatanNama,
				desaId: desa.desaIdShort,
				desaNama: desa.desaNama,
				isInsideKaranganyar: true,
			};
		}
	}

	const nearestDesa = getNearestDesa(point);
	if (!nearestDesa) {
		const fallback = getDefaultLocationFromSpatial();
		return {
			...fallback,
			isInsideKaranganyar: false,
		};
	}

	return {
		provinsiId: nearestDesa.provinsiId,
		kabupatenId: nearestDesa.kabupatenId,
		kecamatanId: nearestDesa.kecamatanId,
		kecamatanNama: nearestDesa.kecamatanNama,
		desaId: nearestDesa.desaIdShort,
		desaNama: nearestDesa.desaNama,
		isInsideKaranganyar: false,
	};
}

function inferLocationByKecamatanName(kecamatanNama: string) {
	const found = tryInferLocationByKecamatanName(kecamatanNama);
	if (!found) return getDefaultLocationFromSpatial();

	return found;
}

function tryInferLocationByKecamatanName(kecamatanNama: string) {
	const found = DESA_SPATIAL_RECORDS.find(
		(item) => normalize(item.kecamatanNama) === normalize(kecamatanNama),
	);

	if (!found) return null;

	return {
		provinsiId: found.provinsiId,
		kabupatenId: found.kabupatenId,
		kecamatanId: found.kecamatanId,
		kecamatanNama: found.kecamatanNama,
		desaId: found.desaIdShort,
		desaNama: found.desaNama,
	};
}

function normalize(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function inferKategoriFromMergeName(fileName: string) {
	const normalizedName = fileName.replace(/\s+/g, " ").trim();
	const match = normalizedName.match(GOOGLE_MERGE_NAME_PATTERN);
	if (!match) return null;

	return normalizeKbliKategori(match[1].toUpperCase());
}

function inferKategoriFromCategoryDir(dirName: string) {
	const match = dirName.trim().match(GOOGLE_CATEGORY_DIR_PATTERN);
	if (!match) return null;

	return normalizeKbliKategori(match[1].toUpperCase());
}

function inferKbliKategoriFromGoogleMapsPath(filePath: string) {
	const fileName = path.basename(filePath);
	const fromMergeName = inferKategoriFromMergeName(fileName);
	if (fromMergeName && fromMergeName !== DEFAULT_KBLI) {
		return fromMergeName;
	}

	const parentDir = path.basename(path.dirname(filePath));
	const fromDirName = inferKategoriFromCategoryDir(parentDir);
	if (fromDirName && fromDirName !== DEFAULT_KBLI) {
		return fromDirName;
	}

	return DEFAULT_KBLI;
}

function classifyGoogleMapsMergeFile(filePath: string) {
	const fileName = path.basename(filePath);
	const ext = path.extname(fileName).toLowerCase();
	if (ext !== ".csv" && ext !== ".xlsx") return null;
	if (!GOOGLE_MERGE_FILE_PATTERN.test(fileName)) return null;

	const category = inferKbliKategoriFromGoogleMapsPath(filePath);
	if (category === DEFAULT_KBLI) return null;

	const priority = ext === ".xlsx" ? 0 : 1;

	return {
		category,
		priority,
	};
}

export async function inferKbliKategoriFromGoogleMapsFilename(
	fileName: string,
) {
	const fromMergeName = inferKategoriFromMergeName(fileName);
	if (fromMergeName && fromMergeName !== DEFAULT_KBLI) {
		return fromMergeName;
	}

	const fromDirName = inferKategoriFromCategoryDir(fileName);
	if (fromDirName && fromDirName !== DEFAULT_KBLI) {
		return fromDirName;
	}

	return DEFAULT_KBLI;
}

function toNumber(value: string, fallback = 0) {
	const normalized = value.replace(/[^\d,.-]/g, "").replace(/,/g, "");
	if (!normalized) return fallback;
	const num = Number(normalized);
	return Number.isFinite(num) ? num : fallback;
}

function parseCsv(content: string): Record<string, string>[] {
	const rows: string[][] = [];
	const currentRow: string[] = [];
	let currentCell = "";
	let inQuotes = false;

	for (let i = 0; i < content.length; i += 1) {
		const char = content[i];
		const next = content[i + 1];

		if (char === '"') {
			if (inQuotes && next === '"') {
				currentCell += '"';
				i += 1;
				continue;
			}
			inQuotes = !inQuotes;
			continue;
		}

		if (!inQuotes && char === ",") {
			currentRow.push(currentCell.trim());
			currentCell = "";
			continue;
		}

		if (!inQuotes && (char === "\n" || char === "\r")) {
			if (char === "\r" && next === "\n") i += 1;
			currentRow.push(currentCell.trim());
			currentCell = "";
			if (currentRow.length > 1 || currentRow[0] !== "") {
				rows.push([...currentRow]);
			}
			currentRow.length = 0;
			continue;
		}

		currentCell += char;
	}

	if (currentCell.length > 0 || currentRow.length > 0) {
		currentRow.push(currentCell.trim());
		rows.push(currentRow);
	}

	if (rows.length < 2) return [];

	const headers = rows[0].map((header) => header.trim());

	return rows.slice(1).map((cells) => {
		const record: Record<string, string> = {};
		headers.forEach((header, index) => {
			record[header] = (cells[index] ?? "").trim();
		});
		return record;
	});
}

function normalizeSourceHeader(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");
}

function normalizeSourceRowValues(row: Record<string, unknown>) {
	const normalized: Record<string, string> = {};

	for (const [key, rawValue] of Object.entries(row)) {
		const normalizedKey = normalizeSourceHeader(key);
		if (!normalizedKey) continue;

		normalized[normalizedKey] = String(rawValue ?? "").trim();
	}

	return normalized;
}

function pickGoogleMapsField(
	row: Record<string, string>,
	candidates: string[],
) {
	for (const key of candidates) {
		const value = row[key];
		if (value && value.trim()) return value.trim();
	}

	return "";
}

function buildGoogleMapsSeedsFromRows(
	sourceRows: Record<string, unknown>[],
	options: {
		fileName?: string;
		kbliKategori?: string;
	} = {},
): IndustrySeedInput[] {
	const output: IndustrySeedInput[] = [];
	const kbliKategori =
		normalizeKbliKategori(options.kbliKategori ?? DEFAULT_KBLI) ||
		DEFAULT_KBLI;

	sourceRows.forEach((rawRow, index) => {
		const row = normalizeSourceRowValues(rawRow);
		const latitude = toNumber(row.latitude);
		const longitude = toNumber(row.longitude);
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

		const namaUsaha =
			pickGoogleMapsField(row, ["title", "name"]) ||
			`Google Maps Row ${index + 1}`;
		const sourceLink =
			pickGoogleMapsField(row, ["link", "maps_url", "url"]) ||
			pickGoogleMapsField(row, ["place_id", "placeid"]) ||
			pickGoogleMapsField(row, ["plus_code", "pluscode"]) ||
			`${options.fileName ?? "google-maps"}-${latitude}-${longitude}-${index + 1}`;
		const locationByCoordinate = inferLocationByCoordinate(
			latitude,
			longitude,
		);
		const location = locationByCoordinate;
		const wilayah = buildWilayahMetadata({
			provinsiId: location.provinsiId,
			kabupatenId: location.kabupatenId,
			kecamatanId: location.kecamatanId,
			kecamatanNama: location.kecamatanNama,
			desaId: location.desaId,
			desaNama: location.desaNama,
		});
		const isInsideKaranganyar = locationByCoordinate.isInsideKaranganyar;

		output.push({
			sourceKey: `gm:${sourceLink}`,
			platform: "Google Maps" as const,
			namaUsaha,
			kbliKategori,
			provinsiId: location.provinsiId,
			kabupatenId: location.kabupatenId,
			kecamatanId: location.kecamatanId,
			kecamatanNama: location.kecamatanNama,
			desaId: location.desaId,
			desaNama: location.desaNama,
			status: "Verifikasi" as const,
			isInsideKaranganyar,
			metadata: {
				wilayah,
				latitude,
				longitude,
				category: pickGoogleMapsField(row, ["category"]),
				address: pickGoogleMapsField(row, ["address"]),
				openHours: pickGoogleMapsField(row, [
					"open_hours",
					"openhours",
				]),
				popularTimes: pickGoogleMapsField(row, [
					"popular_times",
					"populartimes",
				]),
				website: pickGoogleMapsField(row, ["website"]),
				phone: pickGoogleMapsField(row, ["phone"]),
				plusCode: pickGoogleMapsField(row, ["plus_code", "pluscode"]),
				placeId:
					pickGoogleMapsField(row, ["place_id", "placeid"]) ||
					pickGoogleMapsField(row, ["plus_code", "pluscode"]) ||
					pickGoogleMapsField(row, ["link", "maps_url", "url"]) ||
					`gm_${index + 1}`,
				cid: pickGoogleMapsField(row, ["cid"]),
				mapsUrl:
					pickGoogleMapsField(row, ["link", "maps_url", "url"]) ||
					`https://maps.google.com/?q=${latitude},${longitude}`,
				rating: toNumber(
					pickGoogleMapsField(row, ["review_rating", "reviewrating"]),
				),
				reviewCount: Math.trunc(
					toNumber(
						pickGoogleMapsField(row, [
							"review_count",
							"reviewcount",
						]),
					),
				),
				sourceStatus: pickGoogleMapsField(row, ["status"]),
				descriptions: pickGoogleMapsField(row, ["descriptions"]),
				reviewsLink: pickGoogleMapsField(row, [
					"reviews_link",
					"reviewslink",
				]),
				thumbnail: pickGoogleMapsField(row, ["thumbnail"]),
				timezone: pickGoogleMapsField(row, ["timezone"]),
				priceRange: pickGoogleMapsField(row, [
					"price_range",
					"pricerange",
				]),
				dataId: pickGoogleMapsField(row, ["data_id", "dataid"]),
				images: pickGoogleMapsField(row, ["images"]),
				reservations: pickGoogleMapsField(row, ["reservations"]),
				orderOnline: pickGoogleMapsField(row, [
					"order_online",
					"orderonline",
				]),
				menu: pickGoogleMapsField(row, ["menu"]),
				owner: pickGoogleMapsField(row, ["owner"]),
				completeAddress: pickGoogleMapsField(row, [
					"complete_address",
					"completeaddress",
				]),
				about: pickGoogleMapsField(row, ["about"]),
				userReviews: pickGoogleMapsField(row, [
					"user_reviews",
					"userreviews",
				]),
				userReviewsExtended: pickGoogleMapsField(row, [
					"user_reviews_extended",
					"userreviewsextended",
				]),
				emails: pickGoogleMapsField(row, ["emails", "email"]),
			} satisfies GoogleMapsMetadata,
		});
	});

	return output;
}

function buildYoutubeSeeds(content: string): IndustrySeedInput[] {
	const rows = parseCsv(content);
	const output: IndustrySeedInput[] = [];

	rows.forEach((row, index) => {
		const channelId = row.channel_id?.trim();
		if (!channelId) return;

		const channelName = row.channel_name?.trim() || `Channel ${index + 1}`;
		const kecamatanName = pickFirst(row, ["Kecamatan", "kecamatan"]);
		const inferredLocation = kecamatanName
			? tryInferLocationByKecamatanName(kecamatanName)
			: null;
		const isInsideKaranganyar = inferredLocation !== null;

		output.push({
			sourceKey: `yt:${channelId}`,
			platform: "YouTube" as const,
			namaUsaha: channelName,
			kbliKategori: DEFAULT_KBLI,
			kecamatanNama: inferredLocation?.kecamatanNama ?? null,
			desaNama: inferredLocation?.desaNama ?? null,
			status: "Verifikasi" as const,
			isInsideKaranganyar,
			metadata: {
				channelId,
				channelTitle: channelName,
				videoId: channelId,
				videoTitle: `Konten dari ${channelName}`,
				videoUrl: `https://www.youtube.com/channel/${channelId}`,
				publishedAt: row.created_at || "",
				viewCount: Math.trunc(toNumber(row.total_views)),
				likeCount: 0,
				commentCount: 0,
				subscriberCount: Math.trunc(toNumber(row.subscribers)),
			} satisfies YouTubeMetadata,
		});
	});

	return output;
}

function pickFirst(row: Record<string, string>, candidates: string[]) {
	for (const key of candidates) {
		const value = row[key];
		if (value && value.trim()) return value.trim();
	}
	return "";
}

function buildTikTokSeeds(content: string): IndustrySeedInput[] {
	const rows = parseCsv(content);
	const output: IndustrySeedInput[] = [];

	rows.forEach((row, index) => {
		const authorId = pickFirst(row, [
			"author_id",
			"authorId",
			"creator_id",
			"creatorId",
		]);
		const authorUsername = pickFirst(row, [
			"author_username",
			"authorUsername",
			"username",
			"creator_username",
		]);
		const videoId = pickFirst(row, ["video_id", "videoId", "id"]);
		const videoTitle =
			pickFirst(row, ["video_title", "videoTitle", "title"]) ||
			`Video TikTok ${index + 1}`;
		const videoUrl = pickFirst(row, ["video_url", "videoUrl", "url"]);
		const sourceId = videoId || videoUrl || `${authorId}-${index + 1}`;
		if (!sourceId) return;

		const namaUsaha =
			authorUsername || authorId || `TikTok Creator ${index + 1}`;
		const location = {
			...inferLocationByKecamatanName("Karanganyar"),
			isInsideKaranganyar: true,
		};

		output.push({
			sourceKey: `tt:${sourceId}`,
			platform: "TikTok" as const,
			namaUsaha,
			kbliKategori: DEFAULT_KBLI,
			kecamatanNama: location.kecamatanNama,
			desaNama: location.desaNama,
			status: "Verifikasi" as const,
			isInsideKaranganyar: location.isInsideKaranganyar,
			metadata: {
				authorId: authorId || sourceId,
				authorUsername: authorUsername || "@unknown",
				videoId: videoId || sourceId,
				videoTitle,
				videoUrl: videoUrl || "",
				publishedAt: pickFirst(row, [
					"published_at",
					"publishedAt",
					"created_at",
					"createdAt",
				]),
				viewCount: Math.trunc(
					toNumber(
						pickFirst(row, ["view_count", "views", "viewCount"]),
					),
				),
				likeCount: Math.trunc(
					toNumber(
						pickFirst(row, ["like_count", "likes", "likeCount"]),
					),
				),
				commentCount: Math.trunc(
					toNumber(
						pickFirst(row, [
							"comment_count",
							"comments",
							"commentCount",
						]),
					),
				),
				shareCount: Math.trunc(
					toNumber(
						pickFirst(row, ["share_count", "shares", "shareCount"]),
					),
				),
				followerCount: Math.trunc(
					toNumber(
						pickFirst(row, [
							"follower_count",
							"followers",
							"followerCount",
						]),
					),
				),
			} satisfies TikTokMetadata,
		});
	});

	return output;
}

async function readIfExists(filePath: string) {
	try {
		await access(filePath);
		return await readFile(filePath, "utf8");
	} catch {
		return null;
	}
}

async function readFirstExisting(filePaths: string[]) {
	for (const filePath of filePaths) {
		const content = await readIfExists(filePath);
		if (content !== null) return content;
	}

	return null;
}

async function resolveGoogleMapsMergeSources(googleMergeDir: string) {
	const files = (
		await readdir(googleMergeDir, { withFileTypes: true }).catch(() => [])
	)
		.filter((entry) => entry.isFile())
		.map((entry) => path.join(googleMergeDir, entry.name));
	const selectedByCategory = new Map<
		string,
		{ filePath: string; priority: number }
	>();

	for (const filePath of files) {
		const classified = classifyGoogleMapsMergeFile(filePath);
		if (!classified) continue;

		const existing = selectedByCategory.get(classified.category);
		if (!existing || classified.priority < existing.priority) {
			selectedByCategory.set(classified.category, {
				filePath,
				priority: classified.priority,
			});
		}
	}

	return Array.from(selectedByCategory.entries())
		.map(([category, value]) => ({
			category,
			filePath: value.filePath,
		}))
		.sort((a, b) => a.category.localeCompare(b.category, "id-ID"));
}

async function readGoogleMapsSourceRows(filePath: string) {
	const ext = path.extname(filePath).toLowerCase();

	if (ext === ".csv") {
		const content = await readIfExists(filePath);
		if (!content) return [];
		return parseCsv(content);
	}

	if (ext === ".xlsx") {
		try {
			const buffer = await readFile(filePath);
			const workbook = XLSX.read(buffer, {
				type: "buffer",
				raw: false,
			});
			const firstSheetName = workbook.SheetNames[0];
			if (!firstSheetName) return [];

			return XLSX.utils.sheet_to_json<Record<string, unknown>>(
				workbook.Sheets[firstSheetName],
				{
					defval: "",
					raw: false,
				},
			);
		} catch {
			return [];
		}
	}

	return [];
}

export async function readIndustrySeedData(baseDir = process.cwd()) {
	const googleMergeDir = path.join(
		baseDir,
		"public",
		"data",
		"Google Maps",
		"Merge",
	);
	const youtubePaths = [
		path.join(baseDir, "public", "data", "YouTube", "Youtube Data.csv"),
		path.join(baseDir, "public", "data", "YouTube", "YouTube Data.csv"),
	];
	const tiktokPath = path.join(
		baseDir,
		"public",
		"data",
		"TikTok",
		"TikTok Data.csv",
	);

	const [googleMergeSources, youtubeFile, tiktokFile] = await Promise.all([
		resolveGoogleMapsMergeSources(googleMergeDir),
		readFirstExisting(youtubePaths),
		readIfExists(tiktokPath),
	]);

	const googleRowsNested = await Promise.all(
		googleMergeSources.map(async (source) => {
			const rows = await readGoogleMapsSourceRows(source.filePath);
			if (!rows.length) {
				console.warn(
					`Skipping empty Google Maps merge file: ${path.basename(source.filePath)}`,
				);
				return [];
			}

			return buildGoogleMapsSeedsFromRows(rows, {
				fileName: path.basename(source.filePath),
				kbliKategori: source.category,
			});
		}),
	);

	const googleRows = googleRowsNested.flat();
	const youtubeRows = youtubeFile ? buildYoutubeSeeds(youtubeFile) : [];
	const tiktokRows = tiktokFile ? buildTikTokSeeds(tiktokFile) : [];

	return {
		googleRows,
		youtubeRows,
		tiktokRows,
		all: [...googleRows, ...youtubeRows, ...tiktokRows],
	};
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function mapWilayahFromMetadataOrBase(
	metadata: Record<string, unknown>,
	base: {
		provinsiId: string;
		kabupatenId: string;
		kecamatanId: string;
		kecamatanNama: string;
		desaId: string;
		desaNama: string;
	},
): WilayahMetadata {
	const fallback = buildWilayahMetadata(base);
	const wilayahRaw = metadata.wilayah;
	if (!isObject(wilayahRaw)) return fallback;

	const provinsiRaw = isObject(wilayahRaw.provinsi)
		? wilayahRaw.provinsi
		: null;
	const kabupatenRaw = isObject(wilayahRaw.kabupaten)
		? wilayahRaw.kabupaten
		: null;
	const kecamatanRaw = isObject(wilayahRaw.kecamatan)
		? wilayahRaw.kecamatan
		: null;
	const desaRaw = isObject(wilayahRaw.desa) ? wilayahRaw.desa : null;

	return {
		provinsi: {
			id: String(provinsiRaw?.id ?? fallback.provinsi.id),
			nama: String(provinsiRaw?.nama ?? fallback.provinsi.nama),
		},
		kabupaten: {
			id: String(kabupatenRaw?.id ?? fallback.kabupaten.id),
			nama: String(kabupatenRaw?.nama ?? fallback.kabupaten.nama),
		},
		kecamatan: {
			id: String(kecamatanRaw?.id ?? fallback.kecamatan.id),
			nama: String(kecamatanRaw?.nama ?? fallback.kecamatan.nama),
		},
		desa: {
			id: formatShortDesaId(String(desaRaw?.id ?? fallback.desa.id)),
			nama: String(desaRaw?.nama ?? fallback.desa.nama),
		},
	};
}

export function mapIndustryRecordToRow(
	record: DbIndustryRecord,
): IndustryRow | null {
	const metadata = record.metadata;
	if (!isObject(metadata)) return null;

	const base = {
		id: record.id,
		namaUsaha: record.namaUsaha,
		kbliKategori: normalizeKbliKategori(record.kbliKategori),
		kecamatanNama: record.kecamatanNama ?? "",
		desaNama: record.desaNama ?? "",
		status: (record.status as IndustryRow["status"]) ?? "Verifikasi",
		updatedAt: record.updatedAt
			.toISOString()
			.replace("T", " ")
			.slice(0, 19),
		isInsideKaranganyar: record.isInsideKaranganyar,
	};

	if (record.platform === "Google Maps") {
		const provinsiId = record.provinsiId ?? "";
		const kabupatenId = record.kabupatenId ?? "";
		const kecamatanId = record.kecamatanId ?? "";
		const desaId = formatShortDesaId(record.desaId ?? "0");
		const wilayah = mapWilayahFromMetadataOrBase(metadata, {
			provinsiId,
			kabupatenId,
			kecamatanId,
			kecamatanNama: record.kecamatanNama ?? "",
			desaId: record.desaId ?? "0",
			desaNama: record.desaNama ?? "",
		});

		return {
			...base,
			provinsiId,
			kabupatenId,
			kecamatanId,
			desaId,
			platform: "Google Maps",
			metadata: {
				wilayah,
				latitude: toNumber(String(metadata.latitude ?? 0)),
				longitude: toNumber(String(metadata.longitude ?? 0)),
				category: String(metadata.category ?? ""),
				address: String(metadata.address ?? ""),
				openHours: String(metadata.openHours ?? ""),
				popularTimes: String(metadata.popularTimes ?? ""),
				website: String(metadata.website ?? ""),
				phone: String(metadata.phone ?? ""),
				plusCode: String(metadata.plusCode ?? ""),
				placeId: String(metadata.placeId ?? ""),
				cid: String(metadata.cid ?? ""),
				mapsUrl: String(metadata.mapsUrl ?? ""),
				rating: toNumber(String(metadata.rating ?? 0)),
				reviewCount: Math.trunc(
					toNumber(String(metadata.reviewCount ?? 0)),
				),
				sourceStatus: String(metadata.sourceStatus ?? ""),
				descriptions: String(metadata.descriptions ?? ""),
				reviewsLink: String(metadata.reviewsLink ?? ""),
				thumbnail: String(metadata.thumbnail ?? ""),
				timezone: String(metadata.timezone ?? ""),
				priceRange: String(metadata.priceRange ?? ""),
				dataId: String(metadata.dataId ?? ""),
				images: String(metadata.images ?? ""),
				reservations: String(metadata.reservations ?? ""),
				orderOnline: String(metadata.orderOnline ?? ""),
				menu: String(metadata.menu ?? ""),
				owner: String(metadata.owner ?? ""),
				completeAddress: String(metadata.completeAddress ?? ""),
				about: String(metadata.about ?? ""),
				userReviews: String(metadata.userReviews ?? ""),
				userReviewsExtended: String(metadata.userReviewsExtended ?? ""),
				emails: String(metadata.emails ?? ""),
			},
		};
	}

	if (record.platform === "YouTube") {
		return {
			...base,
			platform: "YouTube",
			metadata: {
				channelId: String(metadata.channelId ?? ""),
				channelTitle: String(metadata.channelTitle ?? ""),
				videoId: String(metadata.videoId ?? ""),
				videoTitle: String(metadata.videoTitle ?? ""),
				videoUrl: String(metadata.videoUrl ?? ""),
				publishedAt: String(metadata.publishedAt ?? ""),
				viewCount: Math.trunc(
					toNumber(String(metadata.viewCount ?? 0)),
				),
				likeCount: Math.trunc(
					toNumber(String(metadata.likeCount ?? 0)),
				),
				commentCount: Math.trunc(
					toNumber(String(metadata.commentCount ?? 0)),
				),
				subscriberCount: Math.trunc(
					toNumber(String(metadata.subscriberCount ?? 0)),
				),
			},
		};
	}

	if (record.platform === "TikTok") {
		return {
			...base,
			platform: "TikTok",
			metadata: {
				authorId: String(metadata.authorId ?? ""),
				authorUsername: String(metadata.authorUsername ?? ""),
				videoId: String(metadata.videoId ?? ""),
				videoTitle: String(metadata.videoTitle ?? ""),
				videoUrl: String(metadata.videoUrl ?? ""),
				publishedAt: String(metadata.publishedAt ?? ""),
				viewCount: Math.trunc(
					toNumber(String(metadata.viewCount ?? 0)),
				),
				likeCount: Math.trunc(
					toNumber(String(metadata.likeCount ?? 0)),
				),
				commentCount: Math.trunc(
					toNumber(String(metadata.commentCount ?? 0)),
				),
				shareCount: Math.trunc(
					toNumber(String(metadata.shareCount ?? 0)),
				),
				followerCount: Math.trunc(
					toNumber(String(metadata.followerCount ?? 0)),
				),
			},
		};
	}

	return null;
}
