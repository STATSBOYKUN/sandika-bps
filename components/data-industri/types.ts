export const KBLI_OPTIONS = [
  "AKTIVITAS PENERBITAN, PENYIARAN, SERTA PRODUKSI DAN DISTRIBUSI KONTEN",
  "AKTIVITAS TELEKOMUNIKASI, PEMROGRAMAN KOMPUTER, KONSULTANSI, INFRASTRUKTUR KOMPUTASI, DAN JASA INFORMASI LAINNYA",
] as const;

export const PLATFORM_FILTER_OPTIONS = ["Google Maps", "YouTube", "TikTok"] as const;

export type IndustryPlatform = (typeof PLATFORM_FILTER_OPTIONS)[number];

export type IndustryBaseRow = {
  id: string;
  namaUsaha: string;
  kbliKategori: string;
  provinsiId: string;
  kabupatenId: string;
  kecamatanId: string;
  kecamatanNama: string;
  desaId: string;
  desaNama: string;
  status: "Aktif" | "Verifikasi" | "Draft";
  updatedAt: string;
  isInsideKaranganyar: boolean;
};

export type GoogleMapsMetadata = {
  latitude: number;
  longitude: number;
  placeId: string;
  mapsUrl: string;
  rating: number;
  reviewCount: number;
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

export type GoogleMapsIndustryRow = IndustryBaseRow & {
  platform: "Google Maps";
  metadata: GoogleMapsMetadata;
};

export type YouTubeIndustryRow = IndustryBaseRow & {
  platform: "YouTube";
  metadata: YouTubeMetadata;
};

export type TikTokIndustryRow = IndustryBaseRow & {
  platform: "TikTok";
  metadata: TikTokMetadata;
};

export type IndustryRow =
  | GoogleMapsIndustryRow
  | YouTubeIndustryRow
  | TikTokIndustryRow;

export const PAGE_SIZE_OPTIONS = [100, 250, 500, 1000] as const;
