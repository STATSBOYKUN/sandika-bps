import type { IndustryRow } from "@/components/data-industri/types";

import type { IndustryPointGeoJson } from "@/components/peta-industri/types";

export async function buildLargeIndustryPayload() {
	const response = await fetch("/api/industry", {
		cache: "no-store",
	});

	if (!response.ok) return [];
	const payload = (await response.json()) as { data?: IndustryRow[] };
	return Array.isArray(payload.data) ? payload.data : [];
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
