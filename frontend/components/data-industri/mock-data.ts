import { IndustryRow, KBLI_OPTIONS, PLATFORM_FILTER_OPTIONS } from "@/components/data-industri/types";
import karanganyarDesa from "@/constant/geojson/karanganyar_desa.json";

const STATUS: IndustryRow["status"][] = ["Aktif", "Verifikasi", "Draft"];
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
  const rows = (karanganyarDesa as { features?: DesaFeature[] }).features ?? [];
  const buckets = new Map<string, DesaBucket[]>();

  for (const feature of rows) {
    const kodeKecRaw = feature.properties?.kode_kec;
    const desaId = feature.properties?.kode_kd;
    const desaNama = feature.properties?.kel_desa;
    const kecamatanNama = feature.properties?.kecamatan;

    if (!kodeKecRaw || !desaId || !desaNama || !kecamatanNama) continue;

    const kecamatan = KECAMATAN_STATIC.find((item) => item.nama === kecamatanNama);
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
    lng: randomBetween(INSIDE_COORDINATE_BOX.minLng, INSIDE_COORDINATE_BOX.maxLng),
    lat: randomBetween(INSIDE_COORDINATE_BOX.minLat, INSIDE_COORDINATE_BOX.maxLat),
  };
}

function generateOutsidePoint() {
  const northOrSouth = Math.random() > 0.5;
  if (northOrSouth) {
    return {
      lng: randomBetween(OUTSIDE_COORDINATE_BOX.minLng, OUTSIDE_COORDINATE_BOX.maxLng),
      lat: randomBetween(OUTSIDE_COORDINATE_BOX.maxLat - 0.04, OUTSIDE_COORDINATE_BOX.maxLat),
    };
  }

  return {
    lng: randomBetween(OUTSIDE_COORDINATE_BOX.minLng, OUTSIDE_COORDINATE_BOX.maxLng),
    lat: randomBetween(OUTSIDE_COORDINATE_BOX.minLat, OUTSIDE_COORDINATE_BOX.minLat + 0.04),
  };
}

function getSinglePlatform(index: number): IndustryRow["platform"] {
  return PLATFORM_FILTER_OPTIONS[index % PLATFORM_FILTER_OPTIONS.length];
}

export function buildDummyRows(total = 10_000): IndustryRow[] {
  const insideTarget = Math.floor(total * 0.95);

  return Array.from({ length: total }, (_, index) => {
    const id = index + 1;
    const isInsideKaranganyar = index < insideTarget;
    const insidePoint = isInsideKaranganyar ? generateInsidePoint() : undefined;
    const outsidePoint = isInsideKaranganyar ? undefined : generateOutsidePoint();
    const latitude = Number((insidePoint?.lat ?? outsidePoint?.lat ?? INSIDE_COORDINATE_BOX.maxLat).toFixed(6));
    const longitude = Number((insidePoint?.lng ?? outsidePoint?.lng ?? INSIDE_COORDINATE_BOX.maxLng).toFixed(6));
    const status = STATUS[index % STATUS.length];
    const day = (index % 28) + 1;
    const month = ((index % 12) + 1).toString().padStart(2, "0");
    const hour = (index % 24).toString().padStart(2, "0");
    const minute = ((index * 3) % 60).toString().padStart(2, "0");
    const second = ((index * 7) % 60).toString().padStart(2, "0");
    const kbliKategori = KBLI_OPTIONS[index % KBLI_OPTIONS.length];
    const platform = getSinglePlatform(index);
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
      kecamatanNama: isInsideKaranganyar ? kecamatan.nama : "Luar Karanganyar",
      desaId: isInsideKaranganyar ? (desa?.desaId ?? `33.13.${kecamatan.id}.2001`) : "00.00.00.0000",
      desaNama: isInsideKaranganyar ? (desa?.desaNama ?? `Desa ${kecamatan.nama}`) : "Luar Karanganyar",
      platform,
      status,
      updatedAt: `2026-${month}-${day.toString().padStart(2, "0")} ${hour}:${minute}:${second}`,
      latitude,
      longitude,
      isInsideKaranganyar,
    };
  });
}
