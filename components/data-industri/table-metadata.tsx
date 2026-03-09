import type { ColumnDef } from "@tanstack/react-table";

import type {
  GoogleMapsIndustryRow,
  IndustryPlatform,
  IndustryRow,
  TikTokIndustryRow,
  YouTubeIndustryRow,
} from "@/components/data-industri/types";

export type DataIndustriTabKey = "google-maps" | "youtube" | "tiktok";

export type DataIndustriTabConfig = {
  key: DataIndustriTabKey;
  label: string;
  platform: IndustryPlatform;
  columns: ColumnDef<IndustryRow>[];
  getSearchText: (row: IndustryRow) => string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatShortDesaId(value: string) {
  const last = value.split(".").at(-1) ?? value;
  const trimmed = last.replace(/^0+/, "");
  return trimmed || "0";
}

function provinsiNamaById(provinsiId: string) {
  if (provinsiId === "33") return "Jawa Tengah";
  return "Tidak diketahui";
}

function kabupatenNamaById(kabupatenId: string) {
  if (kabupatenId === "13") return "Karanganyar";
  return "Tidak diketahui";
}

function getWilayahView(row: IndustryRow) {
  if (row.platform === "Google Maps") {
    return row.metadata.wilayah;
  }

  return {
    provinsi: {
      id: row.provinsiId,
      nama: provinsiNamaById(row.provinsiId),
    },
    kabupaten: {
      id: row.kabupatenId,
      nama: kabupatenNamaById(row.kabupatenId),
    },
    kecamatan: {
      id: row.kecamatanId,
      nama: row.kecamatanNama,
    },
    desa: {
      id: formatShortDesaId(row.desaId),
      nama: row.desaNama,
    },
  };
}

function baseColumns(): ColumnDef<IndustryRow>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      size: 190,
      minSize: 150,
      cell: (info) => (
        <span className="font-mono text-xs">{String(info.getValue())}</span>
      ),
    },
    {
      accessorKey: "namaUsaha",
      header: "Nama Usaha",
      size: 320,
      minSize: 260,
      cell: (info) => <span className="whitespace-normal break-words leading-relaxed">{String(info.getValue())}</span>,
    },
    {
      accessorKey: "kbliKategori",
      header: "KBLI BPS",
      size: 520,
      minSize: 360,
      filterFn: (row, columnId, filterValue) => {
        const selected = (filterValue ?? []) as string[];
        if (!selected.length) return true;
        return selected.includes(row.getValue(columnId));
      },
      cell: (info) => (
        <span className="whitespace-normal break-words leading-relaxed">{String(info.getValue())}</span>
      ),
    },
    {
      accessorFn: (row) => {
        const wilayah = getWilayahView(row);
        return `${wilayah.provinsi.id} - ${wilayah.provinsi.nama}`;
      },
      id: "provinsi",
      header: "Provinsi",
      size: 280,
      minSize: 210,
      cell: (info) => <span className="whitespace-normal break-words leading-relaxed">{String(info.getValue())}</span>,
    },
    {
      accessorFn: (row) => {
        const wilayah = getWilayahView(row);
        return `${wilayah.kabupaten.id} - ${wilayah.kabupaten.nama}`;
      },
      id: "kabupaten",
      header: "Kabupaten",
      size: 300,
      minSize: 220,
      cell: (info) => <span className="whitespace-normal break-words leading-relaxed">{String(info.getValue())}</span>,
    },
    {
      accessorFn: (row) => {
        const wilayah = getWilayahView(row);
        return `${wilayah.kecamatan.id} - ${wilayah.kecamatan.nama}`;
      },
      id: "kecamatan",
      header: "Kecamatan",
      size: 300,
      minSize: 220,
      cell: (info) => <span className="whitespace-normal break-words leading-relaxed">{String(info.getValue())}</span>,
    },
    {
      accessorFn: (row) => {
        const wilayah = getWilayahView(row);
        return `${formatShortDesaId(wilayah.desa.id)} - ${wilayah.desa.nama}`;
      },
      id: "desa",
      header: "Desa",
      size: 300,
      minSize: 220,
      cell: (info) => <span className="whitespace-normal break-words leading-relaxed">{String(info.getValue())}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 170,
      minSize: 140,
      cell: (info) => {
        const value = info.getValue() as IndustryRow["status"];
        const tone =
          value === "Aktif"
            ? "badge-success"
            : value === "Verifikasi"
              ? "badge-info"
              : "badge-warning";
        return <span className={`badge ${tone}`}>{value}</span>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Terakhir Update",
      size: 230,
      minSize: 200,
    },
  ];
}

const googleMapsColumns: ColumnDef<IndustryRow>[] = [
  ...baseColumns(),
  {
    accessorFn: (row) =>
      row.platform === "Google Maps"
        ? (row as GoogleMapsIndustryRow).metadata.latitude
        : null,
    id: "latitude",
    header: "Latitude",
    size: 190,
    minSize: 160,
    cell: (info) => {
      const value = info.getValue() as number | null;
      if (value === null) return "-";
      return <span className="font-mono text-xs">{value.toFixed(6)}</span>;
    },
  },
  {
    accessorFn: (row) =>
      row.platform === "Google Maps"
        ? (row as GoogleMapsIndustryRow).metadata.longitude
        : null,
    id: "longitude",
    header: "Longitude",
    size: 190,
    minSize: 160,
    cell: (info) => {
      const value = info.getValue() as number | null;
      if (value === null) return "-";
      return <span className="font-mono text-xs">{value.toFixed(6)}</span>;
    },
  },
  {
    accessorFn: (row) =>
      row.platform === "Google Maps"
        ? (row as GoogleMapsIndustryRow).metadata.placeId
        : "",
    id: "placeId",
    header: "Place ID",
    size: 240,
    minSize: 190,
    cell: (info) => <span className="font-mono text-xs">{String(info.getValue())}</span>,
  },
  {
    accessorFn: (row) =>
      row.platform === "Google Maps" ? (row as GoogleMapsIndustryRow).metadata.rating : 0,
    id: "rating",
    header: "Rating",
    size: 120,
    minSize: 100,
    cell: (info) => Number(info.getValue()).toFixed(1),
  },
  {
    accessorFn: (row) =>
      row.platform === "Google Maps"
        ? (row as GoogleMapsIndustryRow).metadata.reviewCount
        : 0,
    id: "reviewCount",
    header: "Jumlah Ulasan",
    size: 170,
    minSize: 140,
    cell: (info) => formatNumber(Number(info.getValue())),
  },
];

const youtubeColumns: ColumnDef<IndustryRow>[] = [
  ...baseColumns(),
  {
    accessorFn: (row) =>
      row.platform === "YouTube"
        ? (row as YouTubeIndustryRow).metadata.channelTitle
        : "",
    id: "channelTitle",
    header: "Channel",
    size: 260,
    minSize: 200,
  },
  {
    accessorFn: (row) =>
      row.platform === "YouTube" ? (row as YouTubeIndustryRow).metadata.videoTitle : "",
    id: "videoTitle",
    header: "Judul Video",
    size: 320,
    minSize: 250,
    cell: (info) => <span className="line-clamp-2 leading-relaxed">{String(info.getValue())}</span>,
  },
  {
    accessorFn: (row) =>
      row.platform === "YouTube"
        ? (row as YouTubeIndustryRow).metadata.publishedAt
        : "",
    id: "publishedAt",
    header: "Tanggal Publish",
    size: 210,
    minSize: 170,
  },
  {
    accessorFn: (row) =>
      row.platform === "YouTube" ? (row as YouTubeIndustryRow).metadata.viewCount : 0,
    id: "viewCount",
    header: "Views",
    size: 150,
    minSize: 120,
    cell: (info) => formatNumber(Number(info.getValue())),
  },
  {
    accessorFn: (row) =>
      row.platform === "YouTube" ? (row as YouTubeIndustryRow).metadata.likeCount : 0,
    id: "likeCount",
    header: "Likes",
    size: 130,
    minSize: 110,
    cell: (info) => formatNumber(Number(info.getValue())),
  },
  {
    accessorFn: (row) =>
      row.platform === "YouTube"
        ? (row as YouTubeIndustryRow).metadata.commentCount
        : 0,
    id: "commentCount",
    header: "Komentar",
    size: 150,
    minSize: 120,
    cell: (info) => formatNumber(Number(info.getValue())),
  },
  {
    accessorFn: (row) =>
      row.platform === "YouTube"
        ? (row as YouTubeIndustryRow).metadata.subscriberCount
        : 0,
    id: "subscriberCount",
    header: "Subscriber",
    size: 160,
    minSize: 130,
    cell: (info) => formatNumber(Number(info.getValue())),
  },
];

const tiktokColumns: ColumnDef<IndustryRow>[] = [
  ...baseColumns(),
  {
    accessorFn: (row) =>
      row.platform === "TikTok"
        ? (row as TikTokIndustryRow).metadata.authorUsername
        : "",
    id: "authorUsername",
    header: "Author",
    size: 230,
    minSize: 180,
  },
  {
    accessorFn: (row) =>
      row.platform === "TikTok" ? (row as TikTokIndustryRow).metadata.videoTitle : "",
    id: "videoTitle",
    header: "Judul Video",
    size: 320,
    minSize: 250,
    cell: (info) => <span className="line-clamp-2 leading-relaxed">{String(info.getValue())}</span>,
  },
  {
    accessorFn: (row) =>
      row.platform === "TikTok" ? (row as TikTokIndustryRow).metadata.publishedAt : "",
    id: "publishedAt",
    header: "Tanggal Publish",
    size: 210,
    minSize: 170,
  },
  {
    accessorFn: (row) =>
      row.platform === "TikTok" ? (row as TikTokIndustryRow).metadata.viewCount : 0,
    id: "viewCount",
    header: "Views",
    size: 150,
    minSize: 120,
    cell: (info) => formatNumber(Number(info.getValue())),
  },
  {
    accessorFn: (row) =>
      row.platform === "TikTok" ? (row as TikTokIndustryRow).metadata.likeCount : 0,
    id: "likeCount",
    header: "Likes",
    size: 130,
    minSize: 110,
    cell: (info) => formatNumber(Number(info.getValue())),
  },
  {
    accessorFn: (row) =>
      row.platform === "TikTok" ? (row as TikTokIndustryRow).metadata.commentCount : 0,
    id: "commentCount",
    header: "Komentar",
    size: 150,
    minSize: 120,
    cell: (info) => formatNumber(Number(info.getValue())),
  },
  {
    accessorFn: (row) =>
      row.platform === "TikTok" ? (row as TikTokIndustryRow).metadata.shareCount : 0,
    id: "shareCount",
    header: "Share",
    size: 140,
    minSize: 110,
    cell: (info) => formatNumber(Number(info.getValue())),
  },
  {
    accessorFn: (row) =>
      row.platform === "TikTok" ? (row as TikTokIndustryRow).metadata.followerCount : 0,
    id: "followerCount",
    header: "Follower",
    size: 160,
    minSize: 130,
    cell: (info) => formatNumber(Number(info.getValue())),
  },
];

export const DATA_INDUSTRI_TABS: DataIndustriTabConfig[] = [
  {
    key: "google-maps",
    label: "Google Maps",
    platform: "Google Maps",
    columns: googleMapsColumns,
    getSearchText: (row) => {
      if (row.platform !== "Google Maps") return "";
      return [
        row.id,
        row.namaUsaha,
        row.provinsiId,
        row.kabupatenId,
        row.kecamatanNama,
        row.desaNama,
        row.metadata.placeId,
      ]
        .join(" ")
        .toLowerCase();
    },
  },
  {
    key: "youtube",
    label: "YouTube",
    platform: "YouTube",
    columns: youtubeColumns,
    getSearchText: (row) => {
      if (row.platform !== "YouTube") return "";
      return [
        row.id,
        row.namaUsaha,
        row.provinsiId,
        row.kabupatenId,
        row.kecamatanNama,
        row.metadata.channelTitle,
        row.metadata.videoTitle,
      ]
        .join(" ")
        .toLowerCase();
    },
  },
  {
    key: "tiktok",
    label: "TikTok",
    platform: "TikTok",
    columns: tiktokColumns,
    getSearchText: (row) => {
      if (row.platform !== "TikTok") return "";
      return [
        row.id,
        row.namaUsaha,
        row.provinsiId,
        row.kabupatenId,
        row.kecamatanNama,
        row.metadata.authorUsername,
        row.metadata.videoTitle,
      ]
        .join(" ")
        .toLowerCase();
    },
  },
];

export function getTabConfigByKey(key: DataIndustriTabKey) {
  return DATA_INDUSTRI_TABS.find((tab) => tab.key === key) ?? DATA_INDUSTRI_TABS[0];
}
