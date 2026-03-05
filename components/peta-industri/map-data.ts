import type { IndustryRow } from "@/components/data-industri/types";

import type { IndustryPointGeoJson } from "@/components/peta-industri/types";

import { buildDummyRows } from "@/components/data-industri/mock-data";

export function buildLargeIndustryPayload(total = 25_000) {
  return new Promise<IndustryRow[]>((resolve) => {
    window.setTimeout(() => {
      resolve(buildDummyRows(total));
    }, 900);
  });
}

export function rowsToPointGeoJson(rows: IndustryRow[]): IndustryPointGeoJson {
  const googleMapsRows = rows.filter((row) => row.platform === "Google Maps");

  return {
    type: "FeatureCollection",
    features: googleMapsRows.map((row) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [row.metadata.longitude, row.metadata.latitude],
      },
      properties: {
        id: row.id,
        namaUsaha: row.namaUsaha,
        platform: row.platform,
        status: row.status,
      },
    })),
  };
}
