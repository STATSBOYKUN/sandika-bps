export const KBLI_OPTIONS = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
] as const;

export type KbliCode = (typeof KBLI_OPTIONS)[number];

export const KBLI_2025_LABEL_BY_CODE: Record<KbliCode, string> = {
	A: "Pertanian, Kehutanan, dan Perikanan",
	B: "Pertambangan dan Penggalian",
	C: "Industri Pengolahan",
	D: "Pengadaan Listrik, Gas, Uap/Air Panas, dan Udara Dingin",
	E: "Pengelolaan Air, Pengelolaan Air Limbah, Pengelolaan dan Daur Ulang Sampah, serta Aktivitas Remediasi",
	F: "Konstruksi",
	G: "Perdagangan Besar dan Eceran; Reparasi dan Perawatan Mobil dan Sepeda Motor",
	H: "Pengangkutan dan Pergudangan",
	I: "Penyediaan Akomodasi dan Penyediaan Makan Minum",
	J: "Informasi dan Komunikasi",
	K: "Aktivitas Keuangan dan Asuransi",
	L: "Real Estat",
	M: "Aktivitas Profesional, Ilmiah, dan Teknis",
	N: "Aktivitas Penyewaan dan Sewa Guna Usaha Tanpa Hak Opsi, Ketenagakerjaan, Agen Perjalanan, dan Penunjang Usaha Lainnya",
	O: "Administrasi Pemerintahan, Pertahanan, dan Jaminan Sosial Wajib",
	P: "Pendidikan",
	Q: "Aktivitas Kesehatan Manusia dan Aktivitas Sosial",
	R: "Kesenian, Hiburan, dan Rekreasi",
	S: "Aktivitas Jasa Lainnya",
	T: "Aktivitas Rumah Tangga sebagai Pemberi Kerja",
	U: "Aktivitas yang Menghasilkan Barang dan Jasa oleh Rumah Tangga yang Digunakan Sendiri untuk Memenuhi Kebutuhan",
	V: "Aktivitas Badan Internasional dan Badan Ekstra Internasional Lainnya",
};

const LEGACY_KBLI_TO_CODE: Record<string, (typeof KBLI_OPTIONS)[number]> = {
	"AKTIVITAS PENERBITAN, PENYIARAN, SERTA PRODUKSI DAN DISTRIBUSI KONTEN":
		"J",
	"AKTIVITAS TELEKOMUNIKASI, PEMROGRAMAN KOMPUTER, KONSULTANSI, INFRASTRUKTUR KOMPUTASI, DAN JASA INFORMASI LAINNYA":
		"J",
};

export function normalizeKbliKategori(value: string) {
	const normalized = value.trim().toUpperCase();
	if (!normalized) return "";

	if (KBLI_OPTIONS.includes(normalized as (typeof KBLI_OPTIONS)[number])) {
		return normalized;
	}

	const codeMatch = normalized.match(/^([A-V])(?:[\s\-.:]|$)/);
	if (codeMatch) {
		return codeMatch[1];
	}

	return LEGACY_KBLI_TO_CODE[normalized] ?? normalized;
}

export function formatKbliLabel(value: string) {
	const code = normalizeKbliKategori(value);
	if (!code) return "";

	if (KBLI_OPTIONS.includes(code as KbliCode)) {
		const label = KBLI_2025_LABEL_BY_CODE[code as KbliCode];
		return `${code} - ${label}`;
	}

	return value.trim();
}

export const PLATFORM_FILTER_OPTIONS = [
	"Google Maps",
	"YouTube",
	"TikTok",
] as const;

export const KARANGANYAR_COVERAGE_OPTIONS = [
	{
		value: "inside",
		label: "Dalam Karanganyar",
		description: "Tampilkan data yang berada di wilayah Karanganyar.",
	},
	{
		value: "outside",
		label: "Luar Karanganyar",
		description: "Tampilkan data yang berada di luar wilayah Karanganyar.",
	},
	{
		value: "all",
		label: "Semua Wilayah",
		description: "Tampilkan semua data tanpa batasan wilayah.",
	},
] as const;

export type IndustryPlatform = (typeof PLATFORM_FILTER_OPTIONS)[number];
export type KaranganyarCoverageFilter =
	(typeof KARANGANYAR_COVERAGE_OPTIONS)[number]["value"];

export function getKaranganyarCoverageLabel(value: KaranganyarCoverageFilter) {
	return (
		KARANGANYAR_COVERAGE_OPTIONS.find((option) => option.value === value)
			?.label ?? "Dalam Karanganyar"
	);
}

export type IndustryBaseRow = {
	id: string;
	namaUsaha: string;
	kbliKategori: string;
	kecamatanNama: string;
	desaNama: string;
	status: "Aktif" | "Verifikasi" | "Draft";
	updatedAt: string;
	isInsideKaranganyar: boolean;
	provinsiId: string;
	kabupatenId: string;
	kecamatanId: string;
	desaId: string;
};

export type IndustryNonGoogleBaseRow = {
	id: string;
	namaUsaha: string;
	kbliKategori: string;
	kecamatanNama: string;
	desaNama: string;
	status: "Aktif" | "Verifikasi" | "Draft";
	updatedAt: string;
	isInsideKaranganyar: boolean;
};

export type IndustryLocationIdRow = {
	provinsiId: string;
	kabupatenId: string;
	kecamatanId: string;
	desaId: string;
};

export type WilayahMetadata = {
	provinsi: {
		id: string;
		nama: string;
	};
	kabupaten: {
		id: string;
		nama: string;
	};
	kecamatan: {
		id: string;
		nama: string;
	};
	desa: {
		id: string;
		nama: string;
	};
};

export type GoogleMapsMetadata = {
	wilayah: WilayahMetadata;
	latitude: number;
	longitude: number;
	category: string;
	address: string;
	openHours: string;
	popularTimes: string;
	website: string;
	phone: string;
	plusCode: string;
	placeId: string;
	cid: string;
	mapsUrl: string;
	rating: number;
	reviewCount: number;
	sourceStatus: string;
	descriptions: string;
	reviewsLink: string;
	thumbnail: string;
	timezone: string;
	priceRange: string;
	dataId: string;
	images: string;
	reservations: string;
	orderOnline: string;
	menu: string;
	owner: string;
	completeAddress: string;
	about: string;
	userReviews: string;
	userReviewsExtended: string;
	emails: string;
};

export type YouTubeMetadata = {
	channelId: string;
	channelTitle: string;
	videoId: string;
	videoTitle: string;
	videoUrl: string;
	publishedAt: string;
	viewCount: number;
	likeCount: number;
	commentCount: number;
	subscriberCount: number;
};

export type TikTokMetadata = {
	authorId: string;
	authorUsername: string;
	videoId: string;
	videoTitle: string;
	videoUrl: string;
	publishedAt: string;
	viewCount: number;
	likeCount: number;
	commentCount: number;
	shareCount: number;
	followerCount: number;
};

export type GoogleMapsIndustryRow = IndustryBaseRow &
	IndustryLocationIdRow & {
		platform: "Google Maps";
		metadata: GoogleMapsMetadata;
	};

export type YouTubeIndustryRow = IndustryNonGoogleBaseRow & {
	platform: "YouTube";
	metadata: YouTubeMetadata;
};

export type TikTokIndustryRow = IndustryNonGoogleBaseRow & {
	platform: "TikTok";
	metadata: TikTokMetadata;
};

export type IndustryRow =
	| GoogleMapsIndustryRow
	| YouTubeIndustryRow
	| TikTokIndustryRow;

export const PAGE_SIZE_OPTIONS = [100, 250, 500, 1000] as const;
