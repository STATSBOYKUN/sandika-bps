import {
	type GoogleMapsIndustryRow,
	type IndustryBaseRow,
	type IndustryPlatform,
	type IndustryRow,
	KBLI_OPTIONS,
	PLATFORM_FILTER_OPTIONS,
	type TikTokIndustryRow,
	type YouTubeIndustryRow,
} from "@/components/data-industri/types";
import karanganyarDesa from "@/constant/geojson/karanganyar_desa.json";

const STATUS: IndustryBaseRow["status"][] = ["Aktif", "Verifikasi", "Draft"];
const INSIDE_COORDINATE_BOX = {
	minLat: -7.783013,
	maxLat: -7.456099,
	minLng: 110.708361,
	maxLng: 111.196715,
};

const OUTSIDE_COORDINATE_BOX = {
	minLat: -7.93,
	maxLat: -7.34,
	minLng: 110.52,
	maxLng: 111.34,
};

const KECAMATAN_STATIC = [
	{ id: "01", nama: "Jatipuro" },
	{ id: "02", nama: "Jatiyoso" },
	{ id: "03", nama: "Jumapolo" },
	{ id: "04", nama: "Jumantono" },
	{ id: "05", nama: "Matesih" },
	{ id: "06", nama: "Tawangmangu" },
	{ id: "07", nama: "Ngargoyoso" },
	{ id: "08", nama: "Karangpandan" },
	{ id: "09", nama: "Karanganyar" },
	{ id: "10", nama: "Tasikmadu" },
	{ id: "11", nama: "Jaten" },
	{ id: "12", nama: "Colomadu" },
	{ id: "13", nama: "Gondangrejo" },
	{ id: "14", nama: "Kebakkramat" },
	{ id: "15", nama: "Mojogedang" },
	{ id: "16", nama: "Kerjo" },
	{ id: "17", nama: "Jenawi" },
] as const;

type DesaFeature = {
	properties?: {
		kode_kec?: string;
		kode_kd?: string;
		kel_desa?: string;
		kecamatan?: string;
	};
};

type DesaBucket = {
	desaId: string;
	desaNama: string;
};

function buildDesaByKecamatan() {
	const rows =
		(karanganyarDesa as { features?: DesaFeature[] }).features ?? [];
	const buckets = new Map<string, DesaBucket[]>();

	for (const feature of rows) {
		const kodeKecRaw = feature.properties?.kode_kec;
		const desaId = feature.properties?.kode_kd;
		const desaNama = feature.properties?.kel_desa;
		const kecamatanNama = feature.properties?.kecamatan;

		if (!kodeKecRaw || !desaId || !desaNama || !kecamatanNama) continue;

		const kecamatan = KECAMATAN_STATIC.find(
			(item) => item.nama === kecamatanNama,
		);
		const fallbackId = kodeKecRaw.split(".").at(-1) ?? "00";
		const kecamatanId = kecamatan?.id ?? fallbackId;
		const next = buckets.get(kecamatanId) ?? [];
		next.push({ desaId, desaNama });
		buckets.set(kecamatanId, next);
	}

	return buckets;
}

const DESA_BY_KECAMATAN = buildDesaByKecamatan();

function randomBetween(min: number, max: number) {
	return min + Math.random() * (max - min);
}

function generateInsidePoint() {
	return {
		lng: randomBetween(
			INSIDE_COORDINATE_BOX.minLng,
			INSIDE_COORDINATE_BOX.maxLng,
		),
		lat: randomBetween(
			INSIDE_COORDINATE_BOX.minLat,
			INSIDE_COORDINATE_BOX.maxLat,
		),
	};
}

function generateOutsidePoint() {
	const northOrSouth = Math.random() > 0.5;
	if (northOrSouth) {
		return {
			lng: randomBetween(
				OUTSIDE_COORDINATE_BOX.minLng,
				OUTSIDE_COORDINATE_BOX.maxLng,
			),
			lat: randomBetween(
				OUTSIDE_COORDINATE_BOX.maxLat - 0.04,
				OUTSIDE_COORDINATE_BOX.maxLat,
			),
		};
	}

	return {
		lng: randomBetween(
			OUTSIDE_COORDINATE_BOX.minLng,
			OUTSIDE_COORDINATE_BOX.maxLng,
		),
		lat: randomBetween(
			OUTSIDE_COORDINATE_BOX.minLat,
			OUTSIDE_COORDINATE_BOX.minLat + 0.04,
		),
	};
}

function getSinglePlatform(index: number): IndustryPlatform {
	return PLATFORM_FILTER_OPTIONS[index % PLATFORM_FILTER_OPTIONS.length];
}

function randomInt(min: number, max: number) {
	return Math.floor(randomBetween(min, max + 1));
}

function buildBaseRow(index: number, id: number): IndustryBaseRow {
	const isInsideKaranganyar = index % 20 !== 0;
	const status = STATUS[index % STATUS.length];
	const day = (index % 28) + 1;
	const month = ((index % 12) + 1).toString().padStart(2, "0");
	const hour = (index % 24).toString().padStart(2, "0");
	const minute = ((index * 3) % 60).toString().padStart(2, "0");
	const second = ((index * 7) % 60).toString().padStart(2, "0");
	const kbliKategori = KBLI_OPTIONS[index % KBLI_OPTIONS.length];
	const kecamatan = KECAMATAN_STATIC[index % KECAMATAN_STATIC.length];
	const desaList = DESA_BY_KECAMATAN.get(kecamatan.id) ?? [];
	const desa = desaList.length > 0 ? desaList[index % desaList.length] : null;

	return {
		id: `ENT-${id.toString().padStart(5, "0")}`,
		namaUsaha: `Entitas Digital ${id}`,
		kbliKategori,
		provinsiId: "33",
		kabupatenId: "13",
		kecamatanId: isInsideKaranganyar ? kecamatan.id : "00",
		kecamatanNama: isInsideKaranganyar
			? kecamatan.nama
			: "Luar Karanganyar",
		desaId: isInsideKaranganyar
			? (desa?.desaId ?? `33.13.${kecamatan.id}.2001`)
			: "00.00.00.0000",
		desaNama: isInsideKaranganyar
			? (desa?.desaNama ?? `Desa ${kecamatan.nama}`)
			: "Luar Karanganyar",
		status,
		updatedAt: `2026-${month}-${day.toString().padStart(2, "0")} ${hour}:${minute}:${second}`,
		isInsideKaranganyar,
	};
}

function buildWilayah(base: IndustryBaseRow) {
	return {
		provinsi: {
			id: base.provinsiId,
			nama: base.provinsiId === "33" ? "Jawa Tengah" : "Tidak diketahui",
		},
		kabupaten: {
			id: base.kabupatenId,
			nama: base.kabupatenId === "13" ? "Karanganyar" : "Tidak diketahui",
		},
		kecamatan: {
			id: base.kecamatanId,
			nama: base.kecamatanNama,
		},
		desa: {
			id: base.desaId,
			nama: base.desaNama,
		},
	};
}

function buildGoogleMapsRow(
	base: IndustryBaseRow,
	index: number,
): GoogleMapsIndustryRow {
	const point = base.isInsideKaranganyar
		? generateInsidePoint()
		: generateOutsidePoint();
	const latitude = Number(point.lat.toFixed(6));
	const longitude = Number(point.lng.toFixed(6));
	const wilayah = buildWilayah(base);

	return {
		...base,
		platform: "Google Maps",
		metadata: {
			wilayah,
			latitude,
			longitude,
			placeId: `ChI${base.id.replace("ENT-", "")}KRA${index.toString().padStart(3, "0")}`,
			mapsUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
			rating: Number(randomBetween(3.2, 4.9).toFixed(1)),
			reviewCount: randomInt(10, 2400),
		},
	};
}

function buildYoutubeRow(
	base: IndustryBaseRow,
	index: number,
): YouTubeIndustryRow {
	const channelCode = `UC${(100000000 + index).toString(36).toUpperCase()}`;
	const videoCode = `yt_${(900000 + index).toString(36).toUpperCase()}`;

	return {
		...base,
		platform: "YouTube",
		metadata: {
			channelId: channelCode,
			channelTitle: `Channel ${base.namaUsaha}`,
			videoId: videoCode,
			videoTitle: `Highlight ${base.namaUsaha} Episode ${(index % 40) + 1}`,
			videoUrl: `https://www.youtube.com/watch?v=${videoCode}`,
			publishedAt: `2026-${((index % 12) + 1).toString().padStart(2, "0")}-${((index % 28) + 1).toString().padStart(2, "0")}T${(index % 24).toString().padStart(2, "0")}:00:00Z`,
			viewCount: randomInt(500, 900000),
			likeCount: randomInt(20, 45000),
			commentCount: randomInt(2, 7000),
			subscriberCount: randomInt(100, 1200000),
		},
	};
}

function buildTiktokRow(
	base: IndustryBaseRow,
	index: number,
): TikTokIndustryRow {
	const authorId = `tt_author_${(50000 + index).toString(36)}`;
	const videoId = `tt_video_${(700000 + index).toString(36)}`;

	return {
		...base,
		platform: "TikTok",
		metadata: {
			authorId,
			authorUsername: `@${base.namaUsaha.toLowerCase().replace(/\s+/g, "_")}_${index % 99}`,
			videoId,
			videoTitle: `Cuplikan ${base.namaUsaha} ${(index % 60) + 1}`,
			videoUrl: `https://www.tiktok.com/@${authorId}/video/${videoId}`,
			publishedAt: `2026-${((index % 12) + 1).toString().padStart(2, "0")}-${((index % 28) + 1).toString().padStart(2, "0")} ${(index % 24).toString().padStart(2, "0")}:${((index * 2) % 60).toString().padStart(2, "0")}:00`,
			viewCount: randomInt(800, 1800000),
			likeCount: randomInt(40, 140000),
			commentCount: randomInt(5, 11000),
			shareCount: randomInt(2, 35000),
			followerCount: randomInt(250, 1800000),
		},
	};
}

export function buildDummyRows(total = 10_000): IndustryRow[] {
	return Array.from({ length: total }, (_, index) => {
		const id = index + 1;
		const platform = getSinglePlatform(index);
		const base = buildBaseRow(index, id);

		if (platform === "Google Maps") {
			return buildGoogleMapsRow(base, index);
		}

		if (platform === "YouTube") {
			return buildYoutubeRow(base, index);
		}

		return buildTiktokRow(base, index);
	});
}
