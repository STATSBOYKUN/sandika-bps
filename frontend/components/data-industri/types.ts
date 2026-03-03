export const KBLI_OPTIONS = [
  "AKTIVITAS PENERBITAN, PENYIARAN, SERTA PRODUKSI DAN DISTRIBUSI KONTEN",
  "AKTIVITAS TELEKOMUNIKASI, PEMROGRAMAN KOMPUTER, KONSULTANSI, INFRASTRUKTUR KOMPUTASI, DAN JASA INFORMASI LAINNYA",
] as const;

export const PLATFORM_FILTER_OPTIONS = ["YouTube", "Lynk Id", "Google Maps", "TikTok"] as const;

export type PlatformFilterOption = (typeof PLATFORM_FILTER_OPTIONS)[number];

export type IndustryRow = {
  id: string;
  namaUsaha: string;
  kbliKategori: string;
  provinsiId: string;
  kabupatenId: string;
  kecamatanId: string;
  kecamatanNama: string;
  desaId: string;
  desaNama: string;
  platform: PlatformFilterOption;
  status: "Aktif" | "Verifikasi" | "Draft";
  updatedAt: string;
  latitude: number;
  longitude: number;
  isInsideKaranganyar: boolean;
};

export const PAGE_SIZE_OPTIONS = [100, 250, 500, 1000] as const;
